import React, { useState } from "react";
import {
  useMessages,
  useCreateMessage,
  useUpdateMessage,
  useDeleteMessage,
} from "../../hooks/useMessages";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Space,
  Skeleton,
  
  message as antdMessage,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,

  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";

const { confirm } = Modal;

const MessagesAdmin = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { data: messages, isLoading, refetch } = useMessages();
  const createMutation = useCreateMessage();
  const updateMutation = useUpdateMessage();
  const deleteMutation = useDeleteMessage();

  const handleCreate = async (values) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...values });
        antdMessage.success("Message updated successfully");
      } else {
        await createMutation.mutateAsync(values);
        antdMessage.success("Message created successfully");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      content: record.content,
      isActive: record.isActive,
    });
    setIsModalOpen(true);
  };

 


 

const handleDelete = (id) => {
  toast((t) => (
    <div className="p-4">
      <p className="font-medium">Are you sure you want to delete this message?</p>
      <div className="flex justify-end gap-2 mt-3">
        <button
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          onClick={async () => {
            toast.dismiss(t.id); // Close toast
            try {
              await deleteMutation.mutateAsync(id);
            
              refetch();
            } catch (error) {
              toast.error(error.message);
            }
          }}
        >
          Yes
        </button>
        <button
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          onClick={() => toast.dismiss(t.id)}
        >
          No
        </button>
      </div>
    </div>
  ), { duration: 10000, position: "top-center" }); // keep open until user action
};



















  const columns = [
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (text) => <div style={{ whiteSpace: "pre-line" }}>{text}</div>,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => <Switch checked={isActive} disabled />,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  if (isLoading) return <Skeleton active />;

  return (
    <div className="h-[92vh] overflow-y-auto p-4 ">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Add Message
      </Button>

      <Table
        columns={columns}
        dataSource={messages || []}
        rowKey="_id"
        bordered
      />

      <Modal
        title={editingId ? "Edit Message" : "Create Message"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingId(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item
            name="content"
            label="Message Content"
            rules={[
              { required: true, message: "Please enter message content" },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagesAdmin;
