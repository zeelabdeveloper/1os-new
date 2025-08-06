// src/pages/ManagerReview/ApplicationDetailsModal.js
import React from 'react';
import { Modal, Descriptions,Empty, Divider, Tag, Button, Skeleton, Typography, Badge } from 'antd';
import { 
  DownloadOutlined, ClockCircleOutlined, 
  CheckOutlined, CloseOutlined 
} from '@ant-design/icons';

const { Text, Title } = Typography;

const ApplicationDetailsModal = ({ visible, onClose, application, loading, onDownloadResume }) => {
  const getStatusTag = (status) => {
    const statusMap = {
      pending: { icon: <ClockCircleOutlined />, color: 'default', text: 'Pending' },
      selected: { icon: <CheckOutlined />, color: 'success', text: 'Selected' },
      rejected: { icon: <CloseOutlined />, color: 'error', text: 'Rejected' },
      on_hold: { icon: <ClockCircleOutlined />, color: 'warning', text: 'On Hold' }
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Badge
        status={statusInfo.color}
        text={
          <Tag icon={statusInfo.icon} color={statusInfo.color}>
            {statusInfo.text}
          </Tag>
        }
      />
    );
  };

  return (
    <Modal
      title="Application Details"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="download" icon={<DownloadOutlined />} onClick={onDownloadResume}>
          Download Resume
        </Button>,
        <Button key="back" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={800}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : application ? (
        <div>
          <Title level={4} style={{ marginBottom: 24 }}>{application.name}</Title>
          
          <Descriptions title="Basic Information" bordered column={2}>
            <Descriptions.Item label="Email">{application.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{application.phone}</Descriptions.Item>
            <Descriptions.Item label="Current Location">{application.currentLocation || '-'}</Descriptions.Item>
            <Descriptions.Item label="Experience">{application.experience || '-'}</Descriptions.Item>
            <Descriptions.Item label="Education">{application.education || '-'}</Descriptions.Item>
            <Descriptions.Item label="Current Company">{application.currentCompany || '-'}</Descriptions.Item>
          </Descriptions>

          <Divider />

          <Descriptions title="Job Information" bordered column={2}>
            <Descriptions.Item label="Job Title">{application.jobId?.title}</Descriptions.Item>
          
            <Descriptions.Item label="Position">{application.position || '-'}</Descriptions.Item>
            <Descriptions.Item label="Expected Salary">{application.salary || '-'}</Descriptions.Item>
          </Descriptions>

          <Divider />

          <Descriptions title="Review Status" bordered column={2}>
            <Descriptions.Item label="Current Status">
              {getStatusTag(application.managerReview?.status || 'pending')}
            </Descriptions.Item>
            <Descriptions.Item label="Assigned On">
              {new Date(application.managerReview?.assignedAt).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Feedback On" span={2}>
              {application.managerReview?.feedbackAt 
                ? new Date(application.managerReview.feedbackAt).toLocaleDateString() 
                : 'Not provided yet'}
            </Descriptions.Item>
            <Descriptions.Item label="Evaluation Notes" span={2}>
              <Text>
                {application.managerReview?.note || 'No notes provided'}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <Empty description="No application details found" />
      )}
    </Modal>
  );
};

export default ApplicationDetailsModal;