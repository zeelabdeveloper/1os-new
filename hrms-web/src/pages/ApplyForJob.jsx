 



import React, { useState, useEffect } from 'react';
import { 
  useParams, 
  useNavigate 
} from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Upload, 
  Select, 
  DatePicker, 
  Card, 
  Typography, 
 
  Skeleton, 
  Row, 
  Col, 
  Divider,
  Radio,
  Space,
  Alert,
  Steps
} from 'antd';
import { 
  UploadOutlined, 
  ManOutlined, 
  WomanOutlined, 
  QuestionOutlined,
  SolutionOutlined,
  UserOutlined,
  FileDoneOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import axios from '../axiosConfig';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const ApplyForJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  // Fetch job details
  const { data: jobData, isLoading: isJobLoading } = useQuery({
    queryKey: ['jobDetails', jobId],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/tracker/job-link/${jobId}`);
      return response.data.job;
    },
    onError: (err) => {
      toast.error('Failed to load job details');
      console.error('Error fetching job details:', err);
    }
  });
console.log(jobData)
  // Application submission mutation
  const submitApplication = useMutation({
    mutationFn: async (values) => {
      const formData = new FormData();
      
      // Append all form values
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });
       formData.append('createdBy', jobData?.postedBy);
       formData.append('jobId', jobData?._id);
      // Append resume file if exists
      console.log(fileList)
      if (fileList.length > 0) {
        formData.append('resume', fileList[0].originFileObj);
      }
      
      const response = await axios.post(
        `/api/v1/jobs/applications`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    },
    onSuccess: (data) => {
      setApplicationData(data.data);
      setCurrentStep(2); // Move to success step
      toast.success(data.message || 'Application submitted successfully!');
    },
    onError: (error) => {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values=form.getFieldValue()
      // Format date fields
      if (values.dob) {
        values.dob = dayjs(values.dob).format('YYYY-MM-DD');
      }
      
      await submitApplication.mutateAsync(values);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const beforeUpload = (file) => {
    const isValidType = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.type);
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    
    if (!isValidType) {
      toast.error('You can only upload PDF, DOC, or DOCX files!');
      return Upload.LIST_IGNORE;
    }
    
    if (!isLt5M) {
      toast.error('File must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    
    return false;
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const nextStep = () => {
    form.validateFields()
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch(err => {
        console.log('Validation Error:', err);
      });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (isJobLoading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Card loading>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card
        title={
          <div className="text-center">
            <Title level={2} className="mb-0">
              {jobData?.title}
            </Title>
            <Text type="secondary">
              {jobData?.branch?.name} • {jobData?.department?.name} • {jobData?.location}
            </Text>
          </div>
        }
        bordered={false}
        className="shadow-lg"
      >
        <Steps current={currentStep} className="mb-8">
          <Step title="Personal Info" icon={<UserOutlined />} />
          <Step title="Professional Details" icon={<SolutionOutlined />} />
          <Step title="Complete" icon={<CheckCircleOutlined />} />
        </Steps>

        {currentStep === 0 && (
          <div className="animate-fade-in">
            <Form

              form={form}
              layout="vertical"
              initialValues={{
                gender: 'male'
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input size="large" placeholder="John Doe" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input size="large" placeholder="john@example.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please enter your phone number' }]}
                  >
                    <Input size="large" placeholder="+91 9876543210" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="currentLocation"
                    label="Current Location"
                    rules={[{ required: true, message: 'Please enter your location' }]}
                  >
                    <Input size="large" placeholder="City, State" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="gender"
                    label="Gender"
                    rules={[{ required: true }]}
                  >
                    <Radio.Group size="large">
                      <Radio.Button value="male">
                        <ManOutlined /> Male
                      </Radio.Button>
                      <Radio.Button value="female">
                        <WomanOutlined /> Female
                      </Radio.Button>
                      <Radio.Button value="other">
                        <QuestionOutlined /> Other
                      </Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dob"
                    label="Date of Birth"
                    rules={[{ required: true, message: 'Please select your date of birth' }]}
                  >
                    



<DatePicker 
  style={{ width: '100%' }} 
  size="large" 
  disabledDate={current => {
    if (!current) return false;
    return current.valueOf() > dayjs().endOf('day').valueOf();
  }}
/>





                  </Form.Item>
                </Col>
              </Row>

              <div className="flex justify-end mt-6">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={nextStep}
                >
                  Next <SolutionOutlined />
                </Button>
              </div>
            </Form>
          </div>
        )}

        {currentStep === 1 && (
          <div className="animate-fade-in">
            <Form
              form={form}
              layout="vertical"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="experience"
                    label="Years of Experience"
                    rules={[{ required: true, message: 'Please enter your experience' }]}
                  >
                    <Input size="large" placeholder="e.g., 5 years" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="education"
                    label="Highest Education"
                    rules={[{ required: true, message: 'Please enter your education' }]}
                  >
                    <Input size="large" placeholder="e.g., B.Tech in Computer Science" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="currentCompany"
                    label="Current Company (if employed)"
                  >
                    <Input size="large" placeholder="Company Name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="salary"
                    label="Current/Expected Salary"
                  >
                    <Input size="large" placeholder="e.g., 8,00,000 INR" />
                  </Form.Item>
                </Col>
              </Row>

             <Form.Item
  name="zone"
  label="Preferred Work Zone"
>
  <Select
    size="large"
    mode="tags" // allows both selecting and typing new values
    placeholder="Select or type preferred zones"
    tokenSeparators={[","]}
  >
    <Option value="NORTH">North Zone</Option>
    <Option value="SOUTH">South Zone</Option>
    <Option value="EAST">East Zone</Option>
    <Option value="WEST">West Zone</Option>
  </Select>
</Form.Item>

              <Form.Item
                name="weaknesses"
                label="What are your weaknesses?"
              >
                <TextArea rows={3} size="large" />
              </Form.Item>

              <Form.Item
                name="coverLetter"
                label="Cover Letter (Optional)"
              >
                <TextArea 
                  rows={5} 
                  size="large"
                  placeholder="Tell us why you're a good fit for this position..." 
                />
              </Form.Item>

              <Form.Item
                name="resume"
                label="Resume (PDF or DOC)"
                extra="Max file size: 5MB"
              >
                <Upload
                  beforeUpload={beforeUpload}
                  onChange={handleFileChange}
                  fileList={fileList}
                  maxCount={1}
                  accept=".pdf,.doc,.docx"
                >
                  <Button icon={<UploadOutlined />} size="large">
                    Click to Upload
                  </Button>
                </Upload>
              </Form.Item>

              <div className="flex justify-between mt-6">
                <Button 
                  size="large"
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  
                  onClick={handleSubmit}
                  loading={isSubmitting}
                >
                  Submit Application
                </Button>
              </div>
            </Form>
          </div>
        )}

        {currentStep === 2 && applicationData && (
          <div className="animate-fade-in text-center">
            <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
            <Title level={3} className="mt-4">
              Application Submitted Successfully!
            </Title>
            <Text type="secondary" className="block mb-4">
              Thank you for applying for the {jobData?.title} position.
            </Text>

            <Card className="text-left max-w-md mx-auto mb-6">
              <div className="mb-4">
                <Text strong>Application ID:</Text> {applicationData._id}
              </div>
              <div className="mb-4">
                <Text strong>Position:</Text> {jobData?.title}
              </div>
              <div className="mb-4">
                <Text strong>Location:</Text> {jobData?.location}
              </div>
              <div>
                <Text strong>Status:</Text> <span className="text-blue-500">Applied</span>
              </div>
            </Card>

            <Alert
              message="What's Next?"
              description="Our HR team will review your application and contact you if you're selected for the next round. You'll receive an email with tracking details."
              type="info"
              showIcon
              className="max-w-md mx-auto mb-6"
            />

            <div className="space-x-4">
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/')}
              >
                Return Home
              </Button>
              <Button 
                size="large"
                onClick={() => navigate(`/application-status/${applicationData._id}`)}
              >
                Track Application
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApplyForJob;

