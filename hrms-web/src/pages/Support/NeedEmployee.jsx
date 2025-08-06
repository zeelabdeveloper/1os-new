// import React, { useState } from "react";
// import {
//   Form,
//   Input,
//   Button,
//   Select,
//   Card,
//   Spin,
//   Table,
//   Tag,
//   Space,
//   Modal,
// } from "antd";
// import dayjs from "dayjs";
// import {
//   UserAddOutlined,
//   ClockCircleOutlined,
//   CheckOutlined,
//   CloseOutlined,
//   EyeOutlined,
//   LoadingOutlined,
//   DeleteOutlined,
// } from "@ant-design/icons";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import axios from "../../axiosConfig";
// import { toast } from "react-hot-toast";
// import useAuthStore from "../../stores/authStore";
// import { useSearchParams } from "react-router-dom";

// const { Option } = Select;
// const { TextArea } = Input;

// const NeedEmployee = () => {
// const [searchParssams] = useSearchParams();
 
//  const { user } = useAuthStore();
 
// const userId = searchParssams.get('user') ;

// if(userId){
//   user._id=userId
// }



//   const [form] = Form.useForm();
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

//   // Fetch employee requests
//   const {
//     data: requests = [],
//     isLoading: isFetchingRequests,
//     isError: isFetchError,
//     error: fetchError,
//     refetch,
//   } = useQuery({
//     queryKey: ["employeeRequests"],
//     queryFn: async () => {
//       const response = await axios.get(
//         `/api/v1/support/employeeRequests/manager/${user._id}`
//       );
//       return response.data;
//     },
//     refetchOnWindowFocus: false,
//   });

//   // Create new request mutation
//   const { mutate, isPending: isSubmitting } = useMutation({
//     mutationFn: async (values) => {
//       const response = await axios.post(
//         "/api/v1/support/employeeRequests",
//         values
//       );
//       return response.data;
//     },
//     onSuccess: () => {
//       toast.success("Employee request submitted successfully!");
//       form.resetFields();
//       refetch();
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || "Failed to submit request");
//     },
//   });
//   const { mutate: DeleteMutate } = useMutation({
//     mutationFn: async (values) => {
//       console.log(values);
//       const response = await axios.delete(
//         `/api/v1/support/employeeRequests/${values._id}`,
//         values
//       );
//       return response.data;
//     },
//     onSuccess: () => {
//       toast.success("Employee request Deleted successfully!");
//       form.resetFields();
//       refetch();
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || "Failed to Deleted request");
//     },
//   });

//   const onFinish = (values) => {
//     mutate({ ...values, managerId: user._id });
//   };
//   const handleDelete = (values) => {
//     DeleteMutate({ ...values });
//   };

//   const showDetails = (request) => {
//     setSelectedRequest(request);
//     setIsDetailModalVisible(true);
//   };

//   const getStatusTag = (status) => {
//     switch (status) {
//       case "approved":
//         return <Tag color="green">Approved</Tag>;
//       case "rejected":
//         return <Tag color="red">Rejected</Tag>;
//       case "fulfilled":
//         return <Tag color="blue">Fulfilled</Tag>;
//       default:
//         return <Tag color="orange">Pending</Tag>;
//     }
//   };

//   const columns = [
//     {
//       title: "Position",
//       dataIndex: "position",
//       key: "position",
//     },
//     {
//       title: "Department",
//       dataIndex: "department",
//       key: "department",
//     },
//     {
//       title: "Created At",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       render: (text) => dayjs(text).format("DD/MM/YYYY hh:mm A"),
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       render: (status) => getStatusTag(status),
//     },
//     {
//       title: "Urgency",
//       dataIndex: "urgency",
//       key: "urgency",
//       render: (urgency) => (
//         <Tag
//           color={
//             urgency === "high"
//               ? "red"
//               : urgency === "medium"
//               ? "orange"
//               : "green"
//           }
//         >
//           {urgency}
//         </Tag>
//       ),
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (_, record) => (
//         <div className="flex gap-2">
//           <Button icon={<EyeOutlined />} onClick={() => showDetails(record)}>
//             View
//           </Button>

//           <Button
//             danger
//             icon={<DeleteOutlined />}
//             onClick={() => handleDelete(record)}
//           >
//             Delete
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   if (isFetchError) {
//     return (
//       <Card title="Error" bordered={false}>
//         <p>Failed to load requests: {fetchError.message}</p>
//         <Button onClick={refetch}>Retry</Button>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-6    h-[92vh] overflow-y-auto ">
//       <Card
//         title={
//           <>
//             <UserAddOutlined /> My Requests
//           </>
//         }
//         bordered={false}
//         className="shadow-md"
//         loading={isFetchingRequests}
//       >
//         {requests.length > 0 ? (
//           <Table
//             columns={columns}
//             dataSource={Array.isArray(requests) && requests}
//             rowKey="_id"
//             pagination={{ pageSize: 5 }}
//           />
//         ) : (
//           <p>No requests submitted yet</p>
//         )}
//       </Card>

//       <Card
//         title={
//           <>
//             <UserAddOutlined /> Man Power Requirement
//           </>
//         }
//         bordered={false}
//         className="shadow-md"
//       >
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={onFinish}
//           initialValues={{ urgency: "medium" }}
//         >
//           <Form.Item
//             label="department"
//             name="department"
//             rules={[{ required: true, message: "Please enter department" }]}
//           >
//             <Input placeholder="e.g. Coco" />
//           </Form.Item>
//           <Form.Item
//             label="Position"
//             name="position"
//             rules={[{ required: true, message: "Please enter position" }]}
//           >
//             <Input placeholder="e.g., Senior Developer, HR Manager" />
//           </Form.Item>

//           <Form.Item
//             label="Required Count"
//             name="countRequired"
//             rules={[
//               { required: true, message: "Please add at least one Count" },
//             ]}
//           >
//             <Select mode="tags" placeholder="Add skills">
//               {["Store incharge=1", "Pharmasist=1"].map((skill) => (
//                 <Option key={skill} value={skill}>
//                   {skill}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             label="Store / Headquarters"
//             name="store"
//             rules={[{ required: true, message: "Please specify Store" }]}
//           >
//             <TextArea rows={1} placeholder="specify Store..." />
//           </Form.Item>

//           <Form.Item
//             label="Job Description"
//             name="jobDescription"
//             rules={[
//               { required: true, message: "Please provide job description" },
//             ]}
//           >
//             <TextArea rows={4} placeholder="Detailed job description..." />
//           </Form.Item>

//           <Form.Item label="Urgency" name="urgency">
//             <Select>
//               <Option value="low">
//                 <ClockCircleOutlined /> Low
//               </Option>
//               <Option value="medium">
//                 <ClockCircleOutlined /> Medium
//               </Option>
//               <Option value="high">
//                 <ClockCircleOutlined /> High
//               </Option>
//             </Select>
//           </Form.Item>

//           <Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               icon={isSubmitting ? <LoadingOutlined /> : <CheckOutlined />}
//               loading={isSubmitting}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? "Submitting..." : "Submit Request"}
//             </Button>
//             <Button
//               style={{ marginLeft: 8 }}
//               icon={<CloseOutlined />}
//               onClick={() => form.resetFields()}
//               disabled={isSubmitting}
//             >
//               Reset
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>

//       {/* Request Details Modal */}
//       <Modal
//         title="Request Details"
//         open={isDetailModalVisible}
//         onCancel={() => setIsDetailModalVisible(false)}
//         footer={null}
//         width={700}
//       >
//         {selectedRequest && (
//           <div className="space-y-4">
//             {console.log(selectedRequest)}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className="font-semibold">Department:</p>
//                 <p>{selectedRequest.department}</p>
//               </div>
//               <div>
//                 <p className="font-semibold">Position:</p>
//                 <p>{selectedRequest.position}</p>
//               </div>
//               <div>
//                 <p className="font-semibold">Status:</p>
//                 <p>{getStatusTag(selectedRequest.status)}</p>
//               </div>
//               <div>
//                 <p className="font-semibold">Urgency:</p>
//                 <p>{selectedRequest.urgency}</p>
//               </div>
//             </div>

//             <div>
//               <p className="font-semibold">Recuirement:</p>
//               <div className="flex flex-wrap gap-2">
//                 {Array.isArray(selectedRequest?.countRequired) &&
//                   selectedRequest?.countRequired.map((skill) => (
//                     <Tag key={skill}>{skill}</Tag>
//                   ))}
//               </div>
//             </div>

//             <div>
//               <p className="font-semibold">Store:</p>
//               <p>{selectedRequest?.store}</p>
//             </div>

//             <div>
//               <p className="font-semibold">Job Description:</p>
//               <p className="whitespace-pre-line">
//                 {selectedRequest.jobDescription}
//               </p>
//             </div>

//             {selectedRequest.adminFeedback && (
//               <div>
//                 <p className="font-semibold">Admin Feedback:</p>
//                 <p>{selectedRequest.adminFeedback}</p>
//               </div>
//             )}

//             {selectedRequest.candidateDetails && (
//               <div className="mt-4 border-t pt-4">
//                 <h4 className="font-semibold text-lg">Candidate Details:</h4>
//                 <div className="grid grid-cols-2 gap-4 mt-2">
//                   <div>
//                     <p className="font-semibold">Name:</p>
//                     <p>{selectedRequest.candidateDetails.name}</p>
//                   </div>
//                   <div>
//                     <p className="font-semibold">Contact:</p>
//                     <p>{selectedRequest.candidateDetails.contact}</p>
//                   </div>
//                   {selectedRequest.candidateDetails.resumeUrl && (
//                     <div>
//                       <p className="font-semibold">Resume:</p>
//                       <a
//                         href={selectedRequest.candidateDetails.resumeUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-500"
//                       >
//                         View Resume
//                       </a>
//                     </div>
//                   )}
//                   {selectedRequest.candidateDetails.interviewDate && (
//                     <div>
//                       <p className="font-semibold">Interview Date:</p>
//                       <p>
//                         {new Date(
//                           selectedRequest.candidateDetails.interviewDate
//                         ).toLocaleString()}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default NeedEmployee;






import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Spin,
  Table,
  Tag,
  Space,
  Modal,
  Row,
  Col,
  DatePicker,
  Statistic,
  Pagination
} from "antd";
import dayjs from "dayjs";
import {
  UserAddOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  LoadingOutlined,
  DeleteOutlined,
  FilterOutlined
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import { toast } from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import { useSearchParams } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const NeedEmployee = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const userId = searchParams.get('user');
  
  if (userId) {
    user._id = userId;
  }

  const [form] = Form.useForm();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: 5,
    status: null,
    startDate: null,
    endDate: null,
    month: null,
    year: null
  });
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Fetch employee requests with pagination and filters
  const {
    data: requestsData = {
      requests: [],
      total: 0,
      counts: {}
    },
    isLoading: isFetchingRequests,
    isError: isFetchError,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: ["employeeRequests", filterParams],
    queryFn: async () => {
      const params = {
        ...filterParams,
        managerId: user._id,
        startDate: filterParams.startDate?.format('YYYY-MM-DD'),
        endDate: filterParams.endDate?.format('YYYY-MM-DD')
      };
      
      const response = await axios.get("/api/v1/support/employeeRequests/filtered", { params });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  // Create new request mutation
  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post(
        "/api/v1/support/employeeRequests",
        values
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Employee request submitted successfully!");
      form.resetFields();
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit request");
    },
  });

  const { mutate: DeleteMutate } = useMutation({
    mutationFn: async (values) => {
      const response = await axios.delete(
        `/api/v1/support/employeeRequests/${values._id}`,
        values
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Employee request Deleted successfully!");
      form.resetFields();
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to Deleted request");
    },
  });

  const onFinish = (values) => {
    mutate({ ...values, managerId: user._id });
  };

  const handleDelete = (values) => {
    DeleteMutate({ ...values });
  };

  const showDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalVisible(true);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "approved":
        return <Tag color="green">Approved</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      case "fulfilled":
        return <Tag color="blue">Fulfilled</Tag>;
      default:
        return <Tag color="orange">Pending</Tag>;
    }
  };

  const handleFilterChange = (name, value) => {
    setFilterParams(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleDateRangeChange = (dates) => {
    setFilterParams(prev => ({
      ...prev,
      startDate: dates ? dates[0] : null,
      endDate: dates ? dates[1] : null,
      month: null,
      year: null
    }));
  };

  const handleMonthYearChange = (date) => {
    if (date) {
      setFilterParams(prev => ({
        ...prev,
        month: date.month() + 1,
        year: date.year(),
        startDate: null,
        endDate: null
      }));
    } else {
      setFilterParams(prev => ({
        ...prev,
        month: null,
        year: null
      }));
    }
  };

  const columns = [
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD/MM/YYYY hh:mm A"),
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
      render: (urgency) => (
        <Tag
          color={
            urgency === "high"
              ? "red"
              : urgency === "medium"
              ? "orange"
              : "green"
          }
        >
          {urgency}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button icon={<EyeOutlined />} onClick={() => showDetails(record)}>
            View
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isFetchError) {
    return (
      <Card title="Error" bordered={false}>
        <p>Failed to load requests: {fetchError.message}</p>
        <Button onClick={refetch}>Retry</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 h-[92vh] overflow-y-auto p-4">
      {/* Stats Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Requests"
              value={requestsData.total}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending"
              value={requestsData.counts.pending || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Approved"
              value={requestsData.counts.approved || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={requestsData.counts.rejected || 0}
              valueStyle={{ color: '#f5222d' }}
              prefix={<CloseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Section */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>
              <FilterOutlined /> Filters
            </span>
            <Button
              type="text"
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        }
        bordered={false}
        className="shadow-md"
      >
        {isFilterVisible && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-2">Status</label>
              <Select
                className="w-full"
                placeholder="Select Status"
                allowClear
                value={filterParams.status}
                onChange={(value) => handleFilterChange('status', value)}
              >
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="fulfilled">Fulfilled</Option>
              </Select>
            </div>
            
            <div>
              <label className="block mb-2">Date Range</label>
              <RangePicker
                className="w-full"
                onChange={handleDateRangeChange}
                value={[
                  filterParams.startDate,
                  filterParams.endDate
                ]}
              />
            </div>
            
            <div>
              <label className="block mb-2">Month/Year</label>
              <DatePicker
                className="w-full"
                picker="month"
                onChange={handleMonthYearChange}
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </div>
            
            <div className="flex items-end">
              <Button
                type="primary"
                onClick={() => setFilterParams({
                  page: 1,
                  limit: 10,
                  status: null,
                  startDate: null,
                  endDate: null,
                  month: null,
                  year: null
                })}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Requests Table */}
      <Card
        title={
          <>
            <UserAddOutlined /> My Requests
          </>
        }
        bordered={false}
        className="shadow-md"
        loading={isFetchingRequests}
      >
        {requestsData.requests.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={requestsData.requests}
              rowKey="_id"
              pagination={false}
            />
            <div className="mt-4 flex justify-end">
              <Pagination
                current={filterParams.page}
                total={requestsData.total}
                pageSize={filterParams.limit}
                onChange={(page, pageSize) => {
                  setFilterParams(prev => ({
                    ...prev,
                    page,
                    limit: pageSize
                  }));
                }}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              />
            </div>
          </>
        ) : (
          <p>No requests found matching your criteria</p>
        )}
      </Card>

      {/* Request Form */}
      <Card
        title={
          <>
            <UserAddOutlined /> Man Power Requirement
          </>
        }
        bordered={false}
        className="shadow-md"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ urgency: "medium" }}
        >
          <Form.Item
            label="department"
            name="department"
            rules={[{ required: true, message: "Please enter department" }]}
          >
            <Input placeholder="e.g. Coco" />
          </Form.Item>
          <Form.Item
            label="Position"
            name="position"
            rules={[{ required: true, message: "Please enter position" }]}
          >
            <Input placeholder="e.g., Senior Developer, HR Manager" />
          </Form.Item>

          <Form.Item
            label="Required Count"
            name="countRequired"
            rules={[
              { required: true, message: "Please add at least one Count" },
            ]}
          >
            <Select mode="tags" placeholder="Add skills">
              {["Store incharge=1", "Pharmasist=1"].map((skill) => (
                <Option key={skill} value={skill}>
                  {skill}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Store / Headquarters"
            name="store"
            rules={[{ required: true, message: "Please specify Store" }]}
          >
            <TextArea rows={1} placeholder="specify Store..." />
          </Form.Item>

          <Form.Item
            label="Job Description"
            name="jobDescription"
            rules={[
              { required: true, message: "Please provide job description" },
            ]}
          >
            <TextArea rows={4} placeholder="Detailed job description..." />
          </Form.Item>

          <Form.Item label="Urgency" name="urgency">
            <Select>
              <Option value="low">
                <ClockCircleOutlined /> Low
              </Option>
              <Option value="medium">
                <ClockCircleOutlined /> Medium
              </Option>
              <Option value="high">
                <ClockCircleOutlined /> High
              </Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={isSubmitting ? <LoadingOutlined /> : <CheckOutlined />}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              icon={<CloseOutlined />}
              onClick={() => form.resetFields()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
          </Form.Item>
        </Form>
      </Card>

      
  <Modal
        title="Request Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRequest && (
          <div className="space-y-4">
            {console.log(selectedRequest)}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Department:</p>
                <p>{selectedRequest.department}</p>
              </div>
              <div>
                <p className="font-semibold">Position:</p>
                <p>{selectedRequest.position}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <p>{getStatusTag(selectedRequest.status)}</p>
              </div>
              <div>
                <p className="font-semibold">Urgency:</p>
                <p>{selectedRequest.urgency}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold">Recuirement:</p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(selectedRequest?.countRequired) &&
                  selectedRequest?.countRequired.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
              </div>
            </div>

            <div>
              <p className="font-semibold">Store:</p>
              <p>{selectedRequest?.store}</p>
            </div>

            <div>
              <p className="font-semibold">Job Description:</p>
              <p className="whitespace-pre-line">
                {selectedRequest.jobDescription}
              </p>
            </div>

            {selectedRequest.adminFeedback && (
              <div>
                <p className="font-semibold">Admin Feedback:</p>
                <p>{selectedRequest.adminFeedback}</p>
              </div>
            )}

            {selectedRequest.candidateDetails && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold text-lg">Candidate Details:</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="font-semibold">Name:</p>
                    <p>{selectedRequest.candidateDetails.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Contact:</p>
                    <p>{selectedRequest.candidateDetails.contact}</p>
                  </div>
                  {selectedRequest.candidateDetails.resumeUrl && (
                    <div>
                      <p className="font-semibold">Resume:</p>
                      <a
                        href={selectedRequest.candidateDetails.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        View Resume
                      </a>
                    </div>
                  )}
                  {selectedRequest.candidateDetails.interviewDate && (
                    <div>
                      <p className="font-semibold">Interview Date:</p>
                      <p>
                        {new Date(
                          selectedRequest.candidateDetails.interviewDate
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>


    </div>
  );
};

export default NeedEmployee;



