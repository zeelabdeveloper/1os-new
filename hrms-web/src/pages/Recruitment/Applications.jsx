 


import React, { useState } from "react";
import {
  Button,
  Card,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Upload,
  DatePicker,
  Divider,
  Row,
  Col,
  message,
  Steps,
  Timeline,
  Avatar,
  Select,
  Radio,
  Collapse,
  Badge,
  Popconfirm,
  Tooltip,
  Descriptions,
  Pagination,
  Spin
} from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  PhoneOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  QuestionOutlined,
  MailOutlined,
  SolutionOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  RocketOutlined,
  MehOutlined,
  PauseOutlined,
  EditOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchJobs,
  fetchApplications,
 
  submitJobApplication,
  deleteApplicationStatus,
  updateJobApplication,
} from "../../api/jobs";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { debounce } from "lodash";
import OngoingInterviewListFromApplicationCreator from "./OngoiningInterviewListFromApplicationCreator";
// import RecruiterAnalyticsDashboard from "./SingleRecuiterAnalytics";

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const ApplicationManagement = () => {
const [searchParssams] = useSearchParams();
 
 const { user } = useAuthStore();
 
const userId = searchParssams.get('user') ;

if(userId){
  user._id=userId
}


 



  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [searchParams, setSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const { data: jobs = [], isLoading: isJobsLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const {
    data: applicationsData = { data: [], pagination: { total: 0 } },
    refetch,
    isLoading: isApplicationsLoading
  } = useQuery({
    queryKey: ["applications", selectedJob?._id, dateRange, searchParams],
    queryFn: () => fetchApplications(
      selectedJob?._id,
      dateRange,
      user._id,
      searchParams
    ),
  });

  const { mutate: deleteHandler } = useMutation({
    mutationFn: (id) => deleteApplicationStatus(id),
    onSuccess: () => {
      toast.success("Application deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete application"
      );
    },
  });

  const handleDelete = async (id) => {
    deleteHandler(id);
  };

  const handleEdit = (application) => {
    setEditingApplication(application);
    setIsEditModalVisible(true);
  };

  const handleSearch = debounce((values) => {
    setSearchParams(prev => ({
      ...prev,
      search: values.search,
      page: 1
    }));
  }, 500);

  const handlePaginationChange = (page, pageSize) => {
    setSearchParams(prev => ({
      ...prev,
      page,
      limit: pageSize
    }));
  };

  const statusConfig = {
    applied: { title: "Applied", icon: <FileTextOutlined />, color: "#3b82f6" },
    phone_screen: {
      title: "Phone Screen",
      icon: <PhoneOutlined />,
      color: "#f97316",
    },
    interview_round: {
      title: "Interview Round",
      icon: <UserOutlined />,
      color: "#8b5cf6",
    },
    onboarding: {
      title: "Onboarding",
      icon: <RocketOutlined />,
      color: "#7c3aed",
    },
    not_interested: {
      title: "Not Interested",
      icon: <MehOutlined />,
      color: "#64748b",
    },
    rejected: {
      title: "Rejected",
      icon: <CloseOutlined />,
      color: "#ef4444",
    },
    on_hold: {
      title: "On Hold",
      icon: <PauseOutlined />,
      color: "#f59e0b",
    },
  };

  return (
    <div className="p-4 h-[92vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <SolutionOutlined className="mr-2" /> Job Applications
          </h2>
          <p className="text-gray-500">Manage all candidate applications</p>
        </div>
        <Button
          type="primary"
          onClick={() => setIsModalVisible(true)}
          icon={<UserOutlined />}
          size="large"
        >
          New Application
        </Button>
      </div>


  <OngoingInterviewListFromApplicationCreator createdBy={user._id}  /> 




      {/* Filter Section */}
      <Card className="mb-6" bodyStyle={{ padding: "16px" }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Select Job">
              <Select
                placeholder="Select a job"
                onChange={(value) =>
                  setSelectedJob(jobs.find((j) => j._id === value))
                }
                style={{ width: "100%" }}
                loading={isJobsLoading}
              >
                {jobs.map((job) => (
                  <Option key={job._id} value={job._id}>
                    {job.title} ({job.location})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Date Range">
              <DatePicker.RangePicker
                style={{ width: "100%" }}
                onChange={(dates) => setDateRange(dates)}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Search">
              <Input
                placeholder="Search applicants..."
                prefix={<SearchOutlined />}
                allowClear
                onChange={(e) => handleSearch({ search: e.target.value })}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Status Pipeline */}
      <div className="mb-8">
        <Steps current={-1} labelPlacement="vertical" className="custom-steps">
          {Object.values(statusConfig).map((status) => (
            <Step
              key={status.title}
              title={status.title}
              icon={
                <Avatar
                  style={{ backgroundColor: status.color }}
                  icon={status.icon}
                />
              }
            />
          ))}
        </Steps>
      </div>

      {isApplicationsLoading ? (
        <div className="flex justify-center my-8">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Applications by Status */}
          <Row gutter={[16, 16]}>
            {Object.entries(statusConfig).map(([statusKey, status]) => (
              <Col span={24} md={8} key={statusKey}>
                <Card
                  title={
                    <Space>
                      <Badge color={status.color} />
                      {status.title}
                      <Tag color={status.color}>
                        {applicationsData.data.filter((a) => a.status === statusKey).length}
                      </Tag>
                    </Space>
                  }
                  headStyle={{ borderBottom: `2px solid ${status.color}` }}
                  className="status-column h-[40vh] overflow-y-auto"
                >
                  {applicationsData.data
                    .filter((app) => app.status === statusKey)
                    .map((application) => (
                      <Card
                        key={application._id}
                        className="mb-4 application-card"
                        hoverable
                        actions={[
                          <Tooltip title="View Details">
                            <EyeOutlined
                              onClick={() => setSelectedApplication(application)}
                              style={{ color: "#1890ff" }}
                            />
                          </Tooltip>,
                          <Tooltip title="Edit">
                            <EditOutlined
                              onClick={() => handleEdit(application)}
                              style={{ color: "#52c41a" }}
                            />
                          </Tooltip>,
                          <Tooltip title="Delete">
                            <Popconfirm
                              title="Are you sure to delete this application?"
                              onConfirm={() => handleDelete(application._id)}
                            >
                              <DeleteOutlined style={{ color: "#f5222d" }} />
                            </Popconfirm>
                          </Tooltip>,
                        ]}
                      >
                        <div
                        onClick={() => {
  window.location.href = `/recruitment/application?id=${application._id}`;
}}
                          className="flex items-start"
                        >
                          <Avatar
                            size={48}
                            src={application?.avatar}
                            icon={<UserOutlined />}
                            className="mr-3"
                          />
                          <div>
                            <h3 className="font-medium mb-1">{application.name}</h3>
                            <div className="flex items-center text-sm mb-1">
                              <PhoneOutlined className="mr-1" />
                              <span>{application?.phone}</span>
                            </div>
                            <div className="flex items-center text-sm mb-1">
                              <MailOutlined className="mr-1" />
                              <span>{application.email}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CalendarOutlined className="mr-1" />
                              <span>
                                Applied:{" "}
                                {new Date(
                                  application.appliedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <Pagination
              current={searchParams.page}
              total={applicationsData.pagination.total}
              pageSize={searchParams.limit}
              onChange={handlePaginationChange}
              showSizeChanger
              showTotal={(total) => `Total ${total} applications`}
            />
          </div>
        </>
      )}










      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        statusConfig={statusConfig}
      />

      {/* New Application Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            <span>New Job Application</span>
          </Space>
        }
        width={800}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        <ApplicationForm
          jobs={jobs}
          user={user}
          onSuccess={() => {
            setIsModalVisible(false);
            
            refetch();
          }}
        />
      </Modal>

      {/* Edit Application Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Edit Application</span>
          </Space>
        }
        width={800}
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        centered
      >
        <EditApplicationForm
          jobs={jobs}
          application={editingApplication}
          onSuccess={() => {
            setIsEditModalVisible(false);
            refetch();
          }}
        />
      </Modal>
    </div>
  );
};

// ... (Keep the ApplicationDetailsModal, ApplicationForm, and EditApplicationForm components exactly as they were in your original code)


const ApplicationDetailsModal = ({ application, onClose, statusConfig }) => {
   

  // const { mutate: updateStatus } = useMutation({
  //   mutationFn: updateApplicationStatus,
  //   onSuccess: () => {
  //     toast.success("Status updated successfully");
  //     queryClient.invalidateQueries(["applications"]);
  //   },
  //   onError: (e) => {
  //     toast.error(e?.response?.data?.message || "Status updating Error");
  //   },
  // });

  if (!application) return null;

  return (
    <Modal
      title={
        <Space>
          <Avatar src={application.avatar} />
          <span>{application.name}'s Application</span>
        </Space>
      }
      width={900}
      visible={!!application}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Row gutter={24}>
        <Col span={16}>
          <Card title="Application Details" className="mb-4">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Applied For">
                {application.jobId?.title} {application.jobId?.location}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <a href={`mailto:${application.email}`}>{application.email}</a>
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {application.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {application.gender === "male" ? (
                  <Space>
                    <ManOutlined /> Male
                  </Space>
                ) : application.gender === "female" ? (
                  <Space>
                    <WomanOutlined /> Female
                  </Space>
                ) : (
                  <Space>
                    <QuestionOutlined /> Other
                  </Space>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Resume">
                {application?.resume && (
                  <a
                    href={`${import.meta.env.VITE_BACKEND_URL}${
                      application.resume
                    }`}
                  >
                    View Now
                  </a>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Collapse defaultActiveKey={["1"]} className="mb-4">
            <Panel header="Cover Letter" key="1">
              <div className="p-4 bg-gray-50 rounded">
                {application.coverLetter || "No cover letter provided"}
              </div>
            </Panel>
            <Panel header="Weaknesses" key="2">
              <div className="p-4 bg-gray-50 rounded">
                {application.weaknesses || "Not specified"}
              </div>
            </Panel>
          </Collapse>
        </Col>

        <Col span={8}>
          <Card title="Application Timeline" className="mb-4">
            <Timeline mode="left">
              <Timeline.Item
                color="blue"
                label={new Date(application.appliedAt).toLocaleDateString()}
              >
                Applied
                {application.notes && (
                  <div className="text-gray-500 text-xs mt-1">
                    {application.notes}
                  </div>
                )}
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

const ApplicationForm = ({ jobs,user, onSuccess }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const { mutate: submitApplication, isPending: isLoading } = useMutation({
    mutationFn: submitJobApplication,
    onSuccess: (dataa) => {
      toast.success(dataa.message || "Application submitted successfully");
      onSuccess();
    },
    onError: (err) => {
      console.log(err);
      toast.error(err?.response?.data?.message || "Internal Server Error");
    },
  });

  const onFinish = (values) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (values[key]) formData.append(key, values[key]);
    });
    if (fileList.length > 0) {
      formData.append("resume", fileList[0].originFileObj);
    }

formData.append("createdBy", user._id);

    submitApplication(formData);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="jobId"
        label="Select Role"
        rules={[{ required: true, message: "Please select a job" }]}
      >
        <Select
          placeholder="Select a job to apply for"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {jobs.map((job) => (
            <Option key={job._id} value={job._id}>
              {job.title}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            rules={[{ required: true }]}
            name="currentLocation"
            label="Current Location"
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="position" label="Position">
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="zone" label="Zone Selection">
            <Select>
              <Select.Option value="NORTH">North Zone</Select.Option>
              <Select.Option value="SOUTH">South Zone</Select.Option>
              <Select.Option value="EAST">East Zone</Select.Option>
              <Select.Option value="WEST">West Zone</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="salary" label="Current Salary">
            <Input type="number" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="experience" label="Experience (Years)">
            <Input type="number" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="education" label="Education">
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="currentCompany" label="Current Company">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="gender" label="Gender">
        <Radio.Group>
          <Radio value="male">
            <ManOutlined /> Male
          </Radio>
          <Radio value="female">
            <WomanOutlined /> Female
          </Radio>
          <Radio value="other">
            <QuestionOutlined /> Other
          </Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="weaknesses"
        label="What Do You Consider to Be Your Weaknesses?"
      >
        <TextArea rows={3} />
      </Form.Item>

      <Form.Item name="coverLetter" label="Cover Letter">
        <TextArea rows={4} />
      </Form.Item>

      <Form.Item name="resume" label="Resume">
        <Upload
          fileList={fileList}
          maxCount={1}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          accept=".pdf,.doc,.docx"
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Submit Application
        </Button>
      </Form.Item>
    </Form>
  );
};

const EditApplicationForm = ({ jobs, application, onSuccess }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Set form initial values when application changes
  React.useEffect(() => {
    if (application) {
      form.setFieldsValue({
        jobId: application.jobId?._id,
        name: application.name,
        email: application.email,
        phone: application.phone,
        currentLocation: application.currentLocation,
        position: application.position,
        zone: application.zone,
        salary: application.salary,
        experience: application.experience,
        education: application.education,
        currentCompany: application.currentCompany,
        gender: application.gender,
        weaknesses: application.weaknesses,
        coverLetter: application.coverLetter,
      });
    }
  }, [application, form]);

  const { mutate: updateApplication, isPending: isLoading } = useMutation({
    mutationFn: (data) => updateJobApplication(application._id, data),
    onSuccess: (dataa) => {
      toast.success(dataa.message || "Application updated successfully");
      onSuccess();
    },
    onError: (err) => {
      console.log(err);
      toast.error(err?.response?.data?.message || "Internal Server Error");
    },
  });

  const onFinish = (values) => {
    updateApplication(values);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="jobId"
        label="Select Role"
        rules={[{ required: true, message: "Please select a job" }]}
      >
        <Select
          placeholder="Select a job to apply for"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {jobs.map((job) => (
            <Option key={job._id} value={job._id}>
              {job.title}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            rules={[{ required: true }]}
            name="currentLocation"
            label="Current Location"
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="position" label="Position">
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="zone" label="Zone Selection">
            <Select>
              <Select.Option value="NORTH">North Zone</Select.Option>
              <Select.Option value="SOUTH">South Zone</Select.Option>
              <Select.Option value="EAST">East Zone</Select.Option>
              <Select.Option value="WEST">West Zone</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="salary" label="Current Salary">
            <Input type="number" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="experience" label="Experience (Years)">
            <Input type="number" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="education" label="Education">
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="currentCompany" label="Current Company">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="gender" label="Gender">
        <Radio.Group>
          <Radio value="male">
            <ManOutlined /> Male
          </Radio>
          <Radio value="female">
            <WomanOutlined /> Female
          </Radio>
          <Radio value="other">
            <QuestionOutlined /> Other
          </Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="weaknesses"
        label="What Do You Consider to Be Your Weaknesses?"
      >
        <TextArea rows={3} />
      </Form.Item>

      <Form.Item name="coverLetter" label="Cover Letter">
        <TextArea rows={4} />
      </Form.Item>

      {/* <Form.Item name="resume" label="Resume">
        <Upload
          fileList={fileList}
          maxCount={1}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          accept=".pdf,.doc,.docx"
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
        {application?.resume && (
          <div className="mt-2">
            <a
              href={`${import.meta.env.VITE_BACKEND_URL}${application.resume}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Current Resume
            </a>
          </div>
        )}
      </Form.Item> */}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Update Application
        </Button>
      </Form.Item>
    </Form>
  );
};



export default ApplicationManagement;


