// src/pages/ManagerReview/ManagerReview.js
import React, { useState } from 'react';
import { useQuery, useMutation
 } from '@tanstack/react-query';
import { 
  Table, Space, Button, Card, Tag, Skeleton, Empty, Input, Select, 
    Modal, Form, Typography,   Divider, Descriptions, 
  Badge, Dropdown, Menu,  
} from 'antd';
import { 
  FileTextOutlined, CheckOutlined, CloseOutlined, 
  ClockCircleOutlined, SearchOutlined, FilterOutlined,
  DownloadOutlined, EyeOutlined, MoreOutlined 
} from '@ant-design/icons';
import { toast } from 'react-hot-toast';
 
import useAuthStore from '../../stores/authStore';
 
import axiosInstance from '../../axiosConfig';
import ApplicationDetailsModal from '../../components/modals/ApplicationViewModel';
import { useSearchParams } from 'react-router-dom';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ManagerReview = () => {


  const { user } = useAuthStore();
const [searchParssams] = useSearchParams();
const userId = searchParssams.get('user') ;

if(userId){
  user._id=userId
}


  
  const [form] = Form.useForm();
  const [selectedApp, setSelectedApp] = useState(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  // Fetch applications assigned to manager
  const { data, isLoading,refetch, isError } = useQuery({
    queryKey: ['managerApplications', pagination.current, pagination.pageSize, filters],
    queryFn: () =>
      axiosInstance.get('/api/v1/application/manager', {
        params: {
            managerId:user?._id,
          page: pagination.current,
          limit: pagination.pageSize,
          status: filters.status,
          search: filters.search
        },
      }).then(res => res.data),
    enabled: !!user?._id,
  });

 
  // Update manager review mutation
  const updateReviewMutation = useMutation({
    mutationFn: (values) =>
      axiosInstance.patch(`/api/v1/application/${selectedApp?._id}/review`, values),
    onSuccess: () => {
      toast.success('Review updated successfully');
     refetch()
      setIsReviewModalVisible(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update review');
    },
  });

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleStatusFilter = (value) => {
    setFilters({ ...filters, status: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
    setPagination({ ...pagination, current: 1 });
  };

  const showReviewModal = (record) => {
    setSelectedApp(record);
    form.setFieldsValue({
      status: record.managerReview?.status || 'pending',
      note: record.managerReview?.note || '',
    });
    setIsReviewModalVisible(true);
  };

  const showDetailsModal = (record) => {
    setSelectedApp(record);
    setIsDetailsModalVisible(true);
  };

  const handleDownloadResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      updateReviewMutation.mutate(values);
    });
  };

  const handleCancel = () => {
    setIsReviewModalVisible(false);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalVisible(false);
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { icon: <ClockCircleOutlined />, color: 'default', text: 'Pending' },
      selected: { icon: <CheckOutlined />, color: 'success', text: 'Selected' },
      rejected: { icon: <CloseOutlined />, color: 'error', text: 'Rejected' },
      on_hold: { icon: <ClockCircleOutlined />, color: 'warning', text: 'On Hold' }
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Tag icon={statusInfo.icon} color={statusInfo.color}>
        {statusInfo.text}
      </Tag>
    );
  };

  const actionMenu = (record) => (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => showDetailsModal(record)}>
        View Details
      </Menu.Item>
      <Menu.Item key="review" icon={<FileTextOutlined />} onClick={() => showReviewModal(record)}>
        Submit Review
      </Menu.Item>
      {record.resume && (
        <Menu.Item 
          key="download" 
          icon={<DownloadOutlined />} 
          onClick={() => handleDownloadResume(`${import.meta.env.VITE_BACKEND_URL}${record?.resume}`)}
        >
          Download Resume
        </Menu.Item>
      )}
    </Menu>
  );

  const columns = [
    {
      title: 'Applicant Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Job Title',
      dataIndex: ['jobId', 'title'],
      key: 'jobTitle',
      sorter: true,
    },
 
    {
      title: 'Status',
      dataIndex: ['managerReview', 'status'],
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Selected', value: 'selected' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'On Hold', value: 'on_hold' },
      ],
      filterIcon: <FilterOutlined />,
    },
   {
  title: 'Reviewed By',
  key: 'reviewedBy',
  render: (_, record) => {
    return record.managerReview?.reviewedBy?.firstName || 'N/A';
  },
},
    {
      title: 'Assigned On',
      dataIndex: ['managerReview', 'assignedAt'],
      key: 'assignedAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Dropdown overlay={actionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  if (isError) {
    return (
      <Card>
        <Empty description="Failed to load applications" />
      </Card>
    );
  }

  return (
    <div className="manager-review-page">
      <Card
        title="Applications for Review"
        extra={
          <Space>
            <Input
              placeholder="Search applicants or jobs"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              onChange={handleSearch}
              allowClear
            />
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              onChange={handleStatusFilter}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="selected">Selected</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="on_hold">On Hold</Option>
            </Select>
          </Space>
        }
      >
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={data?.applications || []}
              rowKey="_id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: data?.totalApplications,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} applications`,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              onChange={handleTableChange}
              scroll={{ x: true }}
              locale={{
                emptyText: <Empty description="No applications found" />,
              }}
              bordered
            />
          </>
        )}
      </Card>

      {/* Review Modal */}
      <Modal
        title={`Review Application - ${selectedApp?.name}`}
        visible={isReviewModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={updateReviewMutation.isPending}
        width={700}
        okText="Submit Review"
      >
        {selectedApp && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Job Title">{selectedApp.jobId?.title}</Descriptions.Item>
              <Descriptions.Item label="Department">{selectedApp.jobId?.department}</Descriptions.Item>
              <Descriptions.Item label="Current Status">
                {getStatusTag(selectedApp.managerReview?.status || 'pending')}
              </Descriptions.Item>
              <Descriptions.Item label="Assigned On">
                {new Date(selectedApp.managerReview?.assignedAt).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Form form={form} layout="vertical">
              <Form.Item
                name="status"
                label="Decision"
                rules={[{ required: true, message: 'Please select a decision' }]}
              >
                <Select placeholder="Select decision">
                  <Option value="selected">Selected</Option>
                  <Option value="rejected">Rejected</Option>
                  <Option value="on_hold">On Hold</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="note"
                label="Evaluation Notes"
                rules={[{ required: true, message: 'Please enter your evaluation notes' }]}
              >
                <TextArea 
                  rows={6} 
                  placeholder="Enter your detailed evaluation notes..." 
                  showCount 
                  maxLength={1000}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        visible={isDetailsModalVisible}
        onClose={handleDetailsModalClose}
        application={selectedApp}
        loading={isLoading}
        onDownloadResume={() => handleDownloadResume(`${import.meta.env.VITE_BACKEND_URL}${selectedApp?.resume}`)}
      />
    </div>
  );
};

export default ManagerReview;