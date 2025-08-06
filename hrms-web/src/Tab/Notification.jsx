import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../axiosConfig";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  Badge,
  List,
  Popover,
  Button,
  Typography,
  Divider,
  Space,
  Avatar,
  Skeleton,
  message,
  Empty,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";

import toast from "react-hot-toast";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

const { Text } = Typography;

const fetchNotifications = async (page = 1, userId) => {
  const { data } = await axios.get(
    `/api/v1/notifications?page=${page}&limit=50&userId=${userId}`
  );
  return data;
};

const NotificationCenter = ({ userId }) => {
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: notifications,
    isLoading,
    isError,
    isPending,
    isPlaceholderData,
    refetch,
  } = useQuery({
    queryKey: ["notifications", currentPage],
    queryFn: () => fetchNotifications(currentPage, userId),
    placeholderData: (previousData) => previousData,
  });

  // Mark as read mutation (v5 syntax)
  const markAsReadMutation = useMutation({
    mutationFn: (id) => axios.patch(`/api/v1/notifications/${id}/read`),
    onSuccess: () => {
      refetch();
      toast.success("Notification marked as read");
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });

  // Mark all as read mutation (v5 syntax)
  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      axios.patch("/api/v1/notifications/mark-all-read", { userId }),
    onSuccess: () => {
      refetch();
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  // Delete notification mutation (v5 syntax)
  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/v1/notifications/${id}`),
    onSuccess: () => {
      refetch();
      toast.success("Notification deleted");
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(id);
  };

  const unreadCount = notifications?.data?.filter((n) => !n.isRead).length || 0;

  const content = (
    <div style={{ width: 350 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <Text strong>Notifications</Text>
        <Space>
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              onClick={handleMarkAllAsRead}
              loading={markAllAsReadMutation.isPending}
            >
              Mark all as read
            </Button>
          )}
        </Space>
      </div>
      <Divider style={{ margin: "8px 0" }} />

      {isLoading || isPending ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : isError ? (
        <Empty description="Failed to load notifications" />
      ) : notifications?.data?.length === 0 ? (
        <Empty description="No notifications yet" />
      ) : (
        <>
          <List
            className="notification-list"
            style={{ maxHeight: "60vh", overflowY: "auto" }}
            dataSource={notifications?.data || []}
            renderItem={(notification) => (
              <List.Item
                style={{
                  padding: "12px 16px",
                  backgroundColor: notification.isRead ? "#fff" : "#f6ffed",
                  cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                }}
                onClick={() =>
                  !notification.isRead && handleMarkAsRead(notification._id)
                }
                actions={[
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDelete(notification._id, e)}
                    loading={
                      deleteNotificationMutation.isPending &&
                      deleteNotificationMutation.variables === notification._id
                    }
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={notification.sender?.avatar}
                      style={{
                        backgroundColor: notification.isRead
                          ? "#d9d9d9"
                          : "#52c41a",
                      }}
                    >
                      {notification.sender?.firstName?.charAt(0)}
                    </Avatar>
                  }
                  title={
                    <Space
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/${notification?.link}`;
                      }}
                    >
                      <Text
                        className="!text-blue-400 hover:underline cursor-pointer"
                        strong
                      >
                        {notification.title}
                      </Text>
                      {!notification.isRead && <Badge color="green" />}
                    </Space>
                  }
                  description={
                    <>
                      <Text ellipsis>{notification.message}</Text>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(notification.createdAt).fromNow()}
                        </Text>
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "8px 0",
            }}
          >
            <Space>
              <Button
                size="small"
                disabled={currentPage === 1 || isLoading || isPending}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                size="small"
                disabled={
                  !notifications?.pagination?.hasNextPage ||
                  isLoading ||
                  isPending ||
                  isPlaceholderData
                }
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </Space>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      open={visible}
      onOpenChange={(visible) => {
        setVisible(visible);
        if (visible) refetch();
      }}
      placement="bottomRight"
      overlayStyle={{ zIndex: 1050 }}
    >
      <Badge count={unreadCount} overflowCount={9}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{ width: 40, height: 40 }}
          loading={isLoading || isPending}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationCenter;
