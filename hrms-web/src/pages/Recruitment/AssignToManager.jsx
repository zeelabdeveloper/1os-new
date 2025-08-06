// 


import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Button, 
  Form, 
  Divider,
  Select, 
  Spin, 
  Typography,
  Avatar,
  Modal,
  Pagination,
  Radio
} from 'antd';
import { 
  UserOutlined, 
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
  TeamOutlined,
  SolutionOutlined
} from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../axiosConfig';
 

const { Text, Title } = Typography;
const { Option } = Select;

const ASSIGNMENT_TYPES = {
  MANAGER: 'manager',
  HR: 'hr'
};

const AssignToManager = ({ application  }) => {
 
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [assignmentType, setAssignmentType] = useState(ASSIGNMENT_TYPES.MANAGER);
 

  // Search state
  const [searchParams, setSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  // Fetch staff based on assignment type
  const { 
    data: staffData, 
    isLoading: isLoadingStaff,
    isFetching: isFetchingStaff 
  } = useQuery({
    queryKey: ['staff', searchParams, assignmentType],
    queryFn: async () => {
      const params = {
        ...searchParams,
        [assignmentType === ASSIGNMENT_TYPES.MANAGER ? 
          'canEvaluateCandidates' : 'isHR']: true
      };
      
      const response = await axiosInstance.get('/api/v1/user/staff', { params });
      return response.data;
    },
    enabled: isModalVisible,
    keepPreviousData: true,
    onError: () => toast.error('Failed to load staff list')
  });

  // Handle search
  const handleSearch = (value) => {
    setSearchParams(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  // Mutation for assigning
  const assignMutation = useMutation({
    mutationFn: (data) => axiosInstance.post(
      `/api/v1/jobs/applications/assign/${application._id}`, 
      data
    ),
    onSuccess: (data) => {
      
      toast.success(  data.message ||  'Application assigned successfully!');
      setIsModalVisible(false);
      
      
    },
    onError: (error) => {
      toast.error(`Assignment failed: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleAssign = (values) => {
   console.log("sdfsdfsdfds")
    if (staffData?.data) {
      const person = staffData.data.find(p => p._id === values.personId);
      if (person) {
        setSelectedPerson(person);
        assignMutation.mutate({...form.getFieldValue(), assignType:assignmentType}  )
      }
    }
  };

 

  const handleAssignmentTypeChange = (e) => {
    setAssignmentType(e.target.value);
    setSelectedPerson(null);
    form.resetFields(['personId']);
  };

  return (
    <>
      <Button 
        type="primary" 
        className='w-full'
        icon={<ArrowRightOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Cv Submission
      </Button>

      <Modal
        title="Assign Application"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="assign-container">
          <div className="application-info">
            <Text strong>Assigning:</Text>
            <Text>{application?.name}'s application</Text>
          </div>

          <Divider />

          <Radio.Group 
            onChange={handleAssignmentTypeChange}
            value={assignmentType}
            optionType="button"
            buttonStyle="solid"
            className="assignment-type-selector"
          >
            <Radio.Button value={ASSIGNMENT_TYPES.MANAGER}>
              <TeamOutlined /> Assign to Manager
            </Radio.Button>
            {/* <Radio.Button value={ASSIGNMENT_TYPES.HR}>
              <SolutionOutlined /> Transfer to HR
            </Radio.Button> */}
          </Radio.Group>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleAssign}
            className="assign-form"
          >
            <div className="mt-6">
              <Form.Item
                name="personId"
                label={`Select ${assignmentType === ASSIGNMENT_TYPES.MANAGER ? 'Manager' : 'HR'}`}
                rules={[{ required: true, message: 'Please select a person' }]}
              >
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder={`Search ${assignmentType === ASSIGNMENT_TYPES.MANAGER ? 'manager' : 'HR'} by name or email`}
                  optionFilterProp="children"
                  filterOption={false}
                  onSearch={handleSearch}
                  onChange={(value) => {
                    if (staffData?.data) {
                      const person = staffData.data.find(p => p._id === value);
                      setSelectedPerson(person);
                    }
                  }}
                  loading={isLoadingStaff || isFetchingStaff}
                  notFoundContent={
                    isLoadingStaff || isFetchingStaff ? <Spin size="small" /> : null
                  }
                >
                  {Array.isArray(staffData?.data) &&
                    staffData.data.map((person) => (
                      <Option key={person._id} value={person._id}>
                        <div className="flex items-center">
                          <Avatar
                            size="small"
                            src={person.profilePicture}
                            icon={<UserOutlined />}
                            className="mr-2"
                          />
                          {person.firstName} {person.lastName} ({person.email})
                        </div>
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <div className="mt-4 flex justify-end">
                <Pagination
                  size="small"
                  current={searchParams.page}
                  pageSize={searchParams.limit}
                  total={staffData?.totalCount}
                  onChange={(page, pageSize) => {
                    setSearchParams(prev => ({
                      ...prev,
                      page,
                      limit: pageSize,
                    }));
                  }}
                  showSizeChanger
                  showQuickJumper
                />
              </div>
            </div>

            {selectedPerson && (
              <div className="mt-6">
                <Text strong>Selected {assignmentType === ASSIGNMENT_TYPES.MANAGER ? 'Manager' : 'HR'}:</Text>
                <div className="person-info mt-2">
                  <Avatar 
                    size={48} 
                    src={selectedPerson.profilePicture}
                    icon={<UserOutlined />} 
                  />
                  <div className="person-details">
                    <Title level={5} className="mb-0">
                      {selectedPerson.firstName} {selectedPerson.lastName}
                    </Title>
                    <Text type="secondary">{selectedPerson.email}</Text>
                    {selectedPerson.EmployeeId && (
                      <Text type="secondary">Application ID: {selectedPerson.EmployeeId}</Text>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <Button 
                onClick={() => setIsModalVisible(false)}
                icon={<CloseOutlined />}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<CheckOutlined />}
                loading={assignMutation.isPending}
                disabled={!selectedPerson}
              >
                Confirm Assignment
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      <style jsx global>{`
        .assign-container {
          padding: 16px;
        }
        
        .application-info {
          margin-bottom: 16px;
        }
        
        .assignment-type-selector {
          width: 100%;
          margin-bottom: 16px;
        }
        
        .assignment-type-selector .ant-radio-button-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .person-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background-color: #f5f5f5;
          border-radius: 6px;
        }
        
        .person-details {
          display: flex;
          flex-direction: column;
        }
        
        .assign-form {
          margin-top: 16px;
        }
        
        .flex {
          display: flex;
        }
        
        .items-center {
          align-items: center;
        }
        
        .mr-2 {
          margin-right: 8px;
        }
        
        .mt-2 {
          margin-top: 8px;
        }
        
        .mt-4 {
          margin-top: 16px;
        }
        
        .mt-6 {
          margin-top: 24px;
        }
        
        .justify-end {
          justify-content: flex-end;
        }
        
        .gap-4 {
          gap: 16px;
        }
        
        .mb-0 {
          margin-bottom: 0;
        }
      `}</style>
    </>
  );
};

export default AssignToManager;