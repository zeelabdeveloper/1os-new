import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Tag,
  Input,
  Spin,
  Card,
  Divider,
  Modal,
  Timeline,
  Empty,
} from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";

import { useQuery } from "@tanstack/react-query";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { debounce } from "lodash";
import axiosInstance from "../../axiosConfig";

dayjs.extend(relativeTime);

const ManagerSupportActivity = ({ firstManager }) => {
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchRequests = async ({ queryKey }) => {
    const [_, page, pageSize, search, managerId] = queryKey;
    const response = await axiosInstance.get(
      "/api/v1/support/manager-old-requests",
      {
        params: {
          page,
          limit: pageSize,
          search,
          firstManager: managerId,
        },
      }
    );
    return response.data;
  };

  const {
    data: requestsData,
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery({
    queryKey: [
      "managerRequests",
      pagination.current,
      pagination.pageSize,
      searchText,
      firstManager,
    ],
    queryFn: fetchRequests,
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
    onSuccess: (data) => {
      setPagination((prev) => ({
        ...prev,
        total: data.total,
      }));
    },
  });

  
  console.log(requestsData);
  const handleSearch = debounce((value) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, 500);

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const showHistoryModal = (request) => {
    setSelectedRequest(request);
    setIsModalVisible(true);
  };

  const closeHistoryModal = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
  };

  const refreshData = () => {
    refetch();
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "approved":
        return <Tag color="green">Approved</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      case "pending":
        return <Tag color="orange">Pending</Tag>;
      case "fulfilled":
        return <Tag color="blue">Fulfilled</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getUrgencyTag = (urgency) => {
    switch (urgency) {
      case "high":
        return <Tag color="red">High</Tag>;
      case "medium":
        return <Tag color="orange">Medium</Tag>;
      case "low":
        return <Tag color="green">Low</Tag>;
      default:
        return <Tag>{urgency}</Tag>;
    }
  };

  const columns = [
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      sorter: true,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Store",
      dataIndex: "store",
      key: "store",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Urgency",
      dataIndex: "urgency",
      key: "urgency",
      render: (urgency) => getUrgencyTag(urgency),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => dayjs(date).fromNow(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showHistoryModal(record)}
          >
            History
          </Button>
        </Space>
      ),
    },
  ];

  if (isError) {
    return (
      <Card>
        <Empty
          description={
            <span>
              Error loading requests: {error.message}
              <Divider />
              <Button type="primary" onClick={refreshData}>
                Retry
              </Button>
            </span>
          }
        />
      </Card>
    );
  }

  return (
    <div className="p-4">
      <Card
        title={`Manager Support Activity `}
        extra={
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search requests..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: 250 }}
            />
            <Button icon={<ReloadOutlined />} onClick={refreshData}>
              Refresh
            </Button>
          </div>
        }
      >
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={requestsData?.data || []}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: true }}
            loading={isLoading}
          />
        </Spin>
      </Card>

      <Modal
        title={`Request History - ${selectedRequest?.position || ""}`}
        visible={isModalVisible}
        onCancel={closeHistoryModal}
        footer={null}
        width={800}
      >
        {selectedRequest ? (
          <div>
            <div className="mb-6">
              <h3 className="font-semibold">Current Status</h3>
              <div className="flex space-x-4 mt-2">
                <div>
                  <span className="text-gray-600">Status:</span>{" "}
                  {getStatusTag(selectedRequest.status)}
                </div>
                <div>
                  <span className="text-gray-600">Urgency:</span>{" "}
                  {getUrgencyTag(selectedRequest.urgency)}
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>{" "}
                  {dayjs(selectedRequest.updatedAt).format("DD MMM YYYY HH:mm")}
                </div>
              </div>
              {selectedRequest.adminFeedback && (
                <div className="mt-2">
                  <span className="text-gray-600">Admin Feedback:</span>{" "}
                  <p className="mt-1 p-2 bg-gray-50 rounded">
                    {selectedRequest.adminFeedback}
                  </p>
                </div>
              )}
            </div>

            <h3 className="font-semibold mb-4">Activity Timeline</h3>
            {Array.isArray(selectedRequest?.history)  &&    selectedRequest.history?.length > 0 ? (
              <Timeline mode="left">
                {selectedRequest.history.map((item, index) => (
                  <Timeline.Item
                    key={index}
                    label={dayjs(item.timestamp).format("DD MMM YYYY HH:mm")}
                  >
                    <div className="pb-4">
                      <div className="font-medium">
                        {item.handler?.firstName || "System"} - {item.action}
                      </div>
                      {item.field && (
                        <div className="text-sm text-gray-600">
                          Field: {item.field}
                        </div>
                      )}
                      {item.oldValue && (
                        <div className="text-sm">
                          From:{" "}
                          <span className="text-gray-600">{item.oldValue}</span>
                        </div>
                      )}
                      {item.newValue && (
                        <div className="text-sm">
                          To:{" "}
                          <span className="text-gray-600">{item.newValue}</span>
                        </div>
                      )}
                      {item.notes && (
                        <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                          Notes: {item.notes}
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="No history available" />
            )}
          </div>
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  );
};

export default ManagerSupportActivity;
