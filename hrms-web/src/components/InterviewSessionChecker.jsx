// import { useState, useCallback, useMemo } from "react";
// import {
//   Card,
//   Tag,
//   Typography,
//   Button,
//   Select,
//   DatePicker,
//   Input,
//   Avatar,
//   Divider,
//   Spin,
//   List,
//   Descriptions,
//   Rate,
//   Space,
//   Collapse,
//   Form,
//   Row,
//   Col,
//   Radio,
// } from "antd";
// import {
//   ClockCircleOutlined,
//   UserOutlined,
//   CalendarOutlined,
//   FilterOutlined,
//   MailOutlined,
//   PhoneOutlined,
//   EnvironmentOutlined,
//   SolutionOutlined,
//   BookOutlined,
//   TeamOutlined,
//   CheckOutlined,
//   StarOutlined,
// } from "@ant-design/icons";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import dayjs from "dayjs";

// import axios from "../axiosConfig";
// import toast from "react-hot-toast";

// const { Text, Title } = Typography;
// const { Option } = Select;
// const { RangePicker } = DatePicker;
// const { Panel } = Collapse;

// const STATUS_FILTER_OPTIONS = [
//   { value: "scheduled", label: "Scheduled", color: "blue" },
//   { value: "in_progress", label: "Not Answering", color: "orange" },
//   { value: "completed", label: "Completed", color: "green" },
//   { value: "cancelled", label: "Cancelled", color: "red" },
// ];

// const OUTCOME_FILTER_OPTIONS = [
//   { value: "selected", label: "Selected", color: "green" },
//   { value: "rejected", label: "Not Suitable", color: "red" },
//   { value: "hold", label: "Not Answering", color: "orange" },
//   { value: "pending", label: "Pending", color: "blue" },
// ];

// const SKILLS_LIST = [
//   "Grooming",
//   "Pharmaceutical Knowledge",
//   "Problem-solving",
//   "Medication Dispensing",
//   "Adaptability",
//   "Analytical Skills",
//   "Time Management",
//   "Customer Service",
//   "Communication",
//   "Drug Information",
//   "Compliance Knowledge",
//   "Inventory Management",
//   "Computer Skills",
// ];

// const fetchInterviewerSessions = async (interviewerId) => {
//   const { data } = await axios.get(
//     `/api/v1/interview/interviewSessions/by-interviewer/${interviewerId}`
//   );
//   return data.data || [];
// };

// const updateInterviewStatus = async ({ id, isOutCome, status }) => {
//   const { data } = await axios.patch(
//     `/api/v1/interview/interviewSessions/${id}`,
//     { isOutCome, status }
//   );
//   return data;
// };

// const InterviewSessionManager = ({ user }) => {
//   const [expandedRows, setExpandedRows] = useState([]);
//   const [expandedFeedback, setExpandedFeedback] = useState(null);
//   const [ratings, setRatings] = useState({});
//   const [answer, setAnswer] = useState([]);
//   const [feedbackText, setFeedbackText] = useState("");
//   const [activeSkillPanel, setActiveSkillPanel] = useState(null);

//   // State for filters
//   const [statusFilter, setStatusFilter] = useState([]);
//   const [outcomeFilter, setOutcomeFilter] = useState([]);
//   const [dateRange, setDateRange] = useState([]);
//   const [searchText, setSearchText] = useState("");

//   const {
//     data: sessions = [],
//     refetch,
//     isLoading,
//   } = useQuery({
//     queryKey: ["interviewSessions", user?._id],
//     queryFn: () => fetchInterviewerSessions(user._id),
//     enabled: !!user?._id,
//     staleTime: 1000 * 60 * 5,
//   });

//   const statusMutation = useMutation({
//     mutationFn: updateInterviewStatus,
//     onSuccess: (data) => {
//       toast.success(data.message || "Status updated successfully");
//       setExpandedFeedback(null);
//       refetch();
//     },
//     onError: (e) => {
//       toast.error(e?.response?.data?.message || "Can't Update!");
//     },
//   });

//   const handleRatingChange = (skill, value) => {
//     setRatings((prev) => ({
//       ...prev,
//       [skill]: value,
//     }));
//   };

//   const handleSubmitFeedback = (sessionId) => {
//     const s = {
//       sessionId,
//       ratings,
//       answer,
//       comments: feedbackText,
//     };
//     const hasNullAnswer = answer.some(
//       (ans) => ans?.answer === null || ans?.answer === undefined
//     );

//     if (hasNullAnswer) {
//       toast.error("Please select all feedback in the feedback Tab");
//       return;
//     }
//     statusMutation.mutate({ id: sessionId, isOutCome: true, status: s });
//   };

//   const handleStatusChange = useCallback(
//     (sessionId, isOutCome, newStatus) => {
//       statusMutation.mutate({ id: sessionId, isOutCome, status: newStatus });
//     },
//     [statusMutation]
//   );

//   const filteredSessions = useMemo(() => {
//     return sessions
//       .filter((session) => {
//         if (
//           statusFilter.length > 0 &&
//           !statusFilter.includes(session?.status)
//         ) {
//           return false;
//         }
//         if (
//           outcomeFilter.length > 0 &&
//           (!session.outcome || !outcomeFilter.includes(session.outcome))
//         ) {
//           return false;
//         }
//         if (dateRange.length === 2) {
//           const sessionDate = dayjs(session.startTime);
//           if (
//             sessionDate.isBefore(dateRange[0], "day") ||
//             sessionDate.isAfter(dateRange[1], "day")
//           ) {
//             return false;
//           }
//         }
//         if (searchText) {
//           const searchLower = searchText.toLowerCase();
//           if (
//             !session.applicationId?.name?.toLowerCase().includes(searchLower) &&
//             !session.interviewRoundId?.name?.toLowerCase().includes(searchLower)
//           ) {
//             return false;
//           }
//         }
//         return true;
//       })
//       .sort((a, b) => dayjs(b.startTime).diff(dayjs(a.startTime)));
//   }, [sessions, statusFilter, outcomeFilter, dateRange, searchText]);

//   const toggleExpandRow = useCallback((sessionId) => {
//     setExpandedRows((prev) =>
//       prev.includes(sessionId)
//         ? prev.filter((id) => id !== sessionId)
//         : [...prev, sessionId]
//     );
//   }, []);

//   const toggleFeedback = (sessionId, e) => {
//     e.stopPropagation();
//     setFeedbackText(sessionId?.comments || feedbackText);
//     setRatings(sessionId?.ratings || ratings);

//     if (sessionId?.answer) {
//       setAnswer(sessionId.answer);
//     } else {
//       setAnswer(
//         sessionId.interviewRoundId?.questions?.map((question) => ({
//           questionId: question._id,
//           questionText: question.questionText,
//           weightage: question.weightage,
//           expectedAnswer: question.expectedAnswer,
//           answer: null, // Initially no answer
//           isCorrect: false,
//         })) || []
//       );
//     }

//     setExpandedFeedback(
//       expandedFeedback === sessionId._id ? null : sessionId._id
//     );
//   };

//   const handleAnswerChange = (question, e) => {
//     console.log(question);
//     console.log(e);
//     setAnswer((prev) =>
//       prev.map((item) =>
//         item.questionId === question._id
//           ? {
//               ...item,
//               answer: e.target.value,
//               isCorrect: e.target.value === question.expectedAnswer,
//             }
//           : item
//       )
//     );
//   };

//   if (sessions?.length === 0) return null;
//   return (
//     <div className="p-4">
//       <Card
//         title={
//           <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
//             <Title level={4} className="mb-0">
//               <TeamOutlined /> Interview Sessions
//             </Title>
//             <Space>
//               <Button
//                 icon={<FilterOutlined />}
//                 onClick={() => {
//                   setStatusFilter([]);
//                   setOutcomeFilter([]);
//                   setDateRange([]);
//                   setSearchText("");
//                 }}
//               >
//                 Reset Filters
//               </Button>
//             </Space>
//           </div>
//         }
//         bordered={false}
//         className="shadow-sm"
//       >
//         {/* Filter Bar */}
//         <Row gutter={[16, 16]} className="mb-6">
//           <Col xs={24} md={6}>
//             <Input
//               placeholder="Search candidate or round"
//               allowClear
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//             />
//           </Col>
//           <Col xs={24} md={6}>
//             <Select
//               mode="multiple"
//               placeholder="Status"
//               className="w-full"
//               value={statusFilter}
//               onChange={setStatusFilter}
//               options={STATUS_FILTER_OPTIONS}
//               optionRender={({ label, color }) => (
//                 <Tag color={color}>{label}</Tag>
//               )}
//             />
//           </Col>
//           <Col xs={24} md={6}>
//             <Select
//               mode="multiple"
//               placeholder="Outcome"
//               className="w-full"
//               value={outcomeFilter}
//               onChange={setOutcomeFilter}
//               options={OUTCOME_FILTER_OPTIONS}
//               optionRender={({ label, color }) => (
//                 <Tag color={color}>{label}</Tag>
//               )}
//             />
//           </Col>
//           <Col xs={24} md={6}>
//             <RangePicker
//               className="w-full"
//               value={dateRange}
//               onChange={setDateRange}
//             />
//           </Col>
//         </Row>

//         <Divider className="my-4" />

//         {/* Session List */}
//         {isLoading ? (
//           <div className="flex justify-center items-center h-64">
//             <Spin size="large" tip="Loading sessions..." />
//           </div>
//         ) : filteredSessions.length === 0 ? (
//           <div className="text-center py-8">
//             <Text type="secondary">
//               No sessions found matching your criteria
//             </Text>
//           </div>
//         ) : (
//           <List
//             itemLayout="vertical"
//             dataSource={filteredSessions}
//             renderItem={(session) => (
//               <Card
//                 key={session._id}
//                 className="mb-4 hover:shadow-md transition-all"
//                 onClick={() => toggleExpandRow(session._id)}
//                 bodyStyle={{ padding: 16 }}
//               >
//                 <div className="flex flex-col md:flex-row justify-between gap-4">
//                   {/* Candidate Info */}
//                   <div className="flex-1 flex items-start gap-4">
//                     <Avatar
//                       size={48}
//                       src={session.applicationId?.photo}
//                       icon={<UserOutlined />}
//                       className="shadow-sm"
//                     />
//                     <div>
//                       <Text strong className="block text-lg">
//                         {session.applicationId?.name}
//                       </Text>
//                       <Text type="secondary" className="block">
//                         {session.interviewRoundId?.name} • Round{" "}
//                         {session.interviewRoundId?.roundNumber}
//                       </Text>
//                       <Text type="secondary" className="block">
//                         {session.interviewRoundId?.passingScore || "NA"}% •
//                         Passing Score{" "}
//                       </Text>
//                       <Space size="middle" className="mt-2">
//                         <Text>
//                           <CalendarOutlined className="mr-1" />
//                           {dayjs(session.startTime).format("MMM D, YYYY")}
//                         </Text>
//                         <Text>
//                           <ClockCircleOutlined className="mr-1" />
//                           {dayjs(session.startTime).format("h:mm A")} -{" "}
//                           {dayjs(session.endTime).format("h:mm A")}
//                         </Text>
//                       </Space>
//                     </div>
//                   </div>

//                   {/* Status Controls */}
//                   <div className="flex flex-col md:flex-row md:items-center gap-3">
//                     <Select
//                       value={session?.status}
//                       onChange={(value) =>
//                         handleStatusChange(session._id, false, value)
//                       }
//                       className="min-w-[150px]"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       {STATUS_FILTER_OPTIONS.map(({ value, label, color }) => (
//                         <Option key={value} value={value}>
//                           <Tag color={color}>{label}</Tag>
//                         </Option>
//                       ))}
//                     </Select>

//                     {session?.status === "completed" && (
//                       <>
//                         <Select
//                           value={session.outcome || "pending"}
//                           onChange={(value) => {
//                             handleStatusChange(session._id, true, value);
//                           }}
//                           className="min-w-[150px]"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           {OUTCOME_FILTER_OPTIONS.map(
//                             ({ value, label, color }) => (
//                               <Option key={value} value={value}>
//                                 <Tag color={color}>{label}</Tag>
//                               </Option>
//                             )
//                           )}
//                         </Select>

//                         <Button
//                           type={
//                             expandedFeedback === session._id
//                               ? "primary"
//                               : "default"
//                           }
//                           icon={<StarOutlined />}
//                           onClick={(e) => toggleFeedback(session, e)}
//                         >
//                           {expandedFeedback === session._id
//                             ? "Close Feedback"
//                             : "Add Feedback"}
//                         </Button>
//                       </>
//                     )}
//                   </div>
//                 </div>

//                 {/* Feedback Form */}
//                 {expandedFeedback === session._id && (
//                   <div
//                     onClick={(e) => e.stopPropagation()}
//                     className="mt-4 pt-4   border-t border-dashed"
//                   >
//                     <Form layout="vertical">
//                       {session?.interviewRoundId?.questions &&
//                         Array.isArray(session?.interviewRoundId?.questions) && (
//                           <>
//                             <Divider orientation="left">
//                               Interview Questions
//                             </Divider>
//                             {session?.interviewRoundId?.questions.map(
//                               (question, index) => {
//                                 // Find existing answer for this question
//                                 const existingAnswer = answer.find(
//                                   (a) => a.questionId === question._id
//                                 );

//                                 return (
//                                   <Form.Item
//                                     key={question._id}
//                                     label={`${index + 1}. ${
//                                       question.questionText
//                                     }`}
//                                     rules={[
//                                       {
//                                         required: true,
//                                         message: "Please answer this question",
//                                       },
//                                     ]}
//                                   >
//                                     <Radio.Group
//                                       value={existingAnswer?.answer}
//                                       onChange={(e) =>
//                                         handleAnswerChange(question, e)
//                                       }
//                                     >
//                                       <Radio value={true}>Fit</Radio>
//                                       <Radio value={false}>Unfit</Radio>
//                                     </Radio.Group>
//                                   </Form.Item>
//                                 );
//                               }
//                             )}
//                           </>
//                         )}

//                       <Form.Item label="Additional Comments">
//                         <Input.TextArea
//                           rows={4}
//                           value={feedbackText}
//                           onChange={(e) => setFeedbackText(e.target.value)}
//                           placeholder="Provide detailed feedback about the candidate..."
//                         />
//                       </Form.Item>

//                       <Collapse
//                         activeKey={activeSkillPanel}
//                         onChange={(key) => setActiveSkillPanel(key)}
//                         ghost
//                         className="bg-gray-50 rounded-lg p-2 mb-4"
//                       >
//                         <Panel
//                           header={
//                             <Text strong className="flex items-center">
//                               <StarOutlined className="mr-2" />
//                               Rate Skills (
//                               {
//                                 Object.keys(ratings).filter(
//                                   (k) => ratings[k] > 0
//                                 ).length
//                               }
//                               /{SKILLS_LIST.length})
//                             </Text>
//                           }
//                           key="skills"
//                         >
//                           <Row gutter={[16, 16]}>
//                             {SKILLS_LIST.map((skill) => (
//                               <Col xs={24} md={12} key={skill}>
//                                 <div className="flex items-center justify-between">
//                                   <Text>{skill}</Text>
//                                   <Rate
//                                     value={ratings[skill] || 0}
//                                     onChange={(value) =>
//                                       handleRatingChange(skill, value)
//                                     }
//                                   />
//                                 </div>
//                               </Col>
//                             ))}
//                           </Row>
//                         </Panel>
//                       </Collapse>

//                       <div className="flex justify-end gap-2">
//                         <Button onClick={() => setExpandedFeedback(null)}>
//                           Cancel
//                         </Button>
//                         <Button
//                           type="primary"
//                           icon={<CheckOutlined />}
//                           loading={statusMutation.isPending}
//                           onClick={() => handleSubmitFeedback(session._id)}
//                         >
//                           Submit Feedback
//                         </Button>
//                       </div>
//                     </Form>
//                   </div>
//                 )}

//                 {/* Expanded Details */}
//                 {expandedRows.includes(session._id) && (
//                   <div className="mt-4 pt-4 border-t">
//                     <Descriptions
//                       column={{ xs: 1, md: 2 }}
//                       bordered
//                       size="small"
//                     >
//                       <Descriptions.Item
//                         label={
//                           <>
//                             <MailOutlined /> Email
//                           </>
//                         }
//                       >
//                         {session.applicationId?.email || "-"}
//                       </Descriptions.Item>
//                       <Descriptions.Item
//                         label={
//                           <>
//                             <PhoneOutlined /> Phone
//                           </>
//                         }
//                       >
//                         {session.applicationId?.phone || "-"}
//                       </Descriptions.Item>
//                       <Descriptions.Item
//                         label={
//                           <>
//                             <EnvironmentOutlined /> Location
//                           </>
//                         }
//                       >
//                         {session.applicationId?.currentLocation || "-"}
//                       </Descriptions.Item>
//                       <Descriptions.Item
//                         label={
//                           <>
//                             <SolutionOutlined /> Position
//                           </>
//                         }
//                       >
//                         {session.applicationId?.position || "-"}
//                       </Descriptions.Item>
//                       <Descriptions.Item
//                         label={
//                           <>
//                             <TeamOutlined /> Current Company
//                           </>
//                         }
//                       >
//                         {session.applicationId?.currentCompany || "-"}
//                       </Descriptions.Item>
//                       <Descriptions.Item
//                         label={
//                           <>
//                             <BookOutlined /> Education
//                           </>
//                         }
//                       >
//                         {session.applicationId?.education || "-"}
//                       </Descriptions.Item>
//                       {session.notes && (
//                         <Descriptions.Item label="Notes" span={2}>
//                           {session.notes}
//                         </Descriptions.Item>
//                       )}
//                       {session.interviewRoundId?.duration && (
//                         <Descriptions.Item label="Duration" span={2}>
//                           {session.interviewRoundId?.duration}
//                         </Descriptions.Item>
//                       )}
//                       {session.meetingLink && (
//                         <Descriptions.Item label="Meeting Link" span={2}>
//                           <a
//                             href={session.meetingLink}
//                             target="_blank"
//                             rel="noreferrer"
//                           >
//                             Join Meeting
//                           </a>
//                         </Descriptions.Item>
//                       )}
//                       {session.recordingLink && (
//                         <Descriptions.Item label="Recording" span={2}>
//                           <a
//                             href={session.recordingLink}
//                             target="_blank"
//                             rel="noreferrer"
//                           >
//                             View Recording
//                           </a>
//                         </Descriptions.Item>
//                       )}
//                       {session.applicationId?.resume && (
//                         <Descriptions.Item label="Resume" span={2}>
//                           <a
//                             href={`${import.meta.env.VITE_BACKEND_URL}${
//                               session.applicationId.resume
//                             }`}
//                             target="_blank"
//                             rel="noreferrer"
//                           >
//                             Download Resume
//                           </a>
//                         </Descriptions.Item>
//                       )}
//                     </Descriptions>
//                   </div>
//                 )}
//               </Card>
//             )}
//           />
//         )}
//       </Card>
//     </div>
//   );
// };

// export default InterviewSessionManager;



import _ from 'lodash';
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Card,
  Tag,
  Typography,
  Button,
  Select,
  DatePicker,
  Input,
  Avatar,
  Divider,
  Spin,
  List,
  Descriptions,
  Rate,
  Space,
  Collapse,
  Form,
  Row,
  Col,
  Radio,
  Pagination,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FilterOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SolutionOutlined,
  BookOutlined,
  TeamOutlined,
  CheckOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";

import axios from "../axiosConfig";
import toast from "react-hot-toast";

const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const STATUS_FILTER_OPTIONS = [
  { value: "scheduled", label: "Scheduled", color: "blue" },
  { value: "in_progress", label: "Not Answering", color: "orange" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
];

const OUTCOME_FILTER_OPTIONS = [
  { value: "selected", label: "Selected", color: "green" },
  { value: "rejected", label: "Not Suitable", color: "red" },
  { value: "hold", label: "Not Answering", color: "orange" },
  { value: "pending", label: "Pending", color: "blue" },
];

const SKILLS_LIST = [
  "Grooming",
  "Pharmaceutical Knowledge",
  "Problem-solving",
  "Medication Dispensing",
  "Adaptability",
  "Analytical Skills",
  "Time Management",
  "Customer Service",
  "Communication",
  "Drug Information",
  "Compliance Knowledge",
  "Inventory Management",
  "Computer Skills",
];

const fetchInterviewerSessions = async (interviewerId, page = 1, pageSize = 10, filters = {}) => {
  console.log(filters)
  const params = {
    page,
    limit: pageSize,
    status: filters.statusFilter,
    outcome: filters.outcomeFilter,
    search: filters.searchText,
  };

  if (filters.dateRange?.length === 2) {
    params.startDate = filters.dateRange[0].startOf('day').toISOString();
    params.endDate = filters.dateRange[1].endOf('day').toISOString();
  }

  const { data } = await axios.get(
    `/api/v1/interview/interviewSessions/by-interviewer/${interviewerId}`,
    { params }
  );
  return data;
};

const updateInterviewStatus = async ({ id, isOutCome, status }) => {
  const { data } = await axios.patch(
    `/api/v1/interview/interviewSessions/${id}`,
    { isOutCome, status }
  );
  return data;
};

const InterviewSessionManager = ({ user }) => {
  const [expandedRows, setExpandedRows] = useState([]);
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [ratings, setRatings] = useState({});
  const [answer, setAnswer] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [activeSkillPanel, setActiveSkillPanel] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
const [searchInputValue, setSearchInputValue] = useState(""); // Separate state for the input 


const debouncedSearch = useMemo(
  () => _.debounce((value) => setSearchText(value), 500),
  []
);

// Update the immediate input value and trigger debounced search
const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchInputValue(value); // Update immediately for responsive input
  debouncedSearch(value); // Debounce the actual filter update
};

// Clean up the debounce on unmount
useEffect(() => {
  return () => {
    debouncedSearch.cancel();
  };
}, [debouncedSearch]);

  // State for filters
  const [statusFilter, setStatusFilter] = useState([]);
  const [outcomeFilter, setOutcomeFilter] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [searchText, setSearchText] = useState("");
console.log(statusFilter)
  const {
    data: sessionsData = {},
    refetch,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "interviewSessions", 
      user?._id, 
      pagination.current, 
      pagination.pageSize,
      { statusFilter, outcomeFilter, dateRange, searchText }
    ],
    queryFn: () => fetchInterviewerSessions(
      user._id,
      pagination.current,
      pagination.pageSize,
      { statusFilter, outcomeFilter, dateRange, searchText }
    ),
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });


 

  const statusMutation = useMutation({
    mutationFn: updateInterviewStatus,
    onSuccess: (data) => {
      toast.success(data.message || "Status updated successfully");
      setExpandedFeedback(null);
      refetch();
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || "Can't Update!");
    },
  });

  const handleRatingChange = (skill, value) => {
    setRatings((prev) => ({
      ...prev,
      [skill]: value,
    }));
  };

  const handleSubmitFeedback = (sessionId) => {
    const s = {
      sessionId,
      ratings,
      answer,
      comments: feedbackText,
    };
    const hasNullAnswer = answer.some(
      (ans) => ans?.answer === null || ans?.answer === undefined
    );

    if (hasNullAnswer) {
      toast.error("Please select all feedback in the feedback Tab");
      return;
    }
    statusMutation.mutate({ id: sessionId, isOutCome: true, status: s });
  };

  const handleStatusChange = useCallback(
    (sessionId, isOutCome, newStatus) => {
      statusMutation.mutate({ id: sessionId, isOutCome, status: newStatus });
    },
    [statusMutation]
  );

  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize,
    }));
  };

  const filteredSessions = useMemo(() => {
    return sessionsData.data || [];
  }, [sessionsData]);

  const toggleExpandRow = useCallback((sessionId) => {
    setExpandedRows((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  }, []);

  const toggleFeedback = (sessionId, e) => {
    e.stopPropagation();
    setFeedbackText(sessionId?.comments || feedbackText);
    setRatings(sessionId?.ratings || ratings);

    if (sessionId?.answer) {
      setAnswer(sessionId.answer);
    } else {
      setAnswer(
        sessionId.interviewRoundId?.questions?.map((question) => ({
          questionId: question._id,
          questionText: question.questionText,
          weightage: question.weightage,
          expectedAnswer: question.expectedAnswer,
          answer: null, // Initially no answer
          isCorrect: false,
        })) || []
      );
    }

    setExpandedFeedback(
      expandedFeedback === sessionId._id ? null : sessionId._id
    );
  };

  const handleAnswerChange = (question, e) => {
    setAnswer((prev) =>
      prev.map((item) =>
        item.questionId === question._id
          ? {
              ...item,
              answer: e.target.value,
              isCorrect: e.target.value === question.expectedAnswer,
            }
          : item
      )
    );
  };

  if ( searchText==""  && statusFilter.length===0 &&
    
    outcomeFilter.length===0 &&
    dateRange?.length===0  
    && (sessionsData.data?.length === 0 || !sessionsData.data) && !isLoading) return null;

  return (
    <div className="p-4">
      <Card
        title={
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <Title level={4} className="mb-0">
              <TeamOutlined /> Interview Sessions
            </Title>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setStatusFilter([]);
                  setOutcomeFilter([]);
                  setDateRange([]);
                  setSearchText("");
                  setPagination(prev => ({ ...prev, current: 1 }));
                }}
                disabled={isFetching}
              >
                Reset Filters
              </Button>
            </Space>
          </div>
        }
        bordered={false}
        className="shadow-sm"
      >
        {/* Filter Bar */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search candidate or round"
              allowClear
  value={searchInputValue} // Use the immediate value state
  onChange={handleSearchChange} // Use the new handler
              disabled={isFetching}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              mode="multiple"
              placeholder="Status"
              className="w-full"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_FILTER_OPTIONS}
              optionRender={({ label, color }) => (
                <Tag color={color}>{label}</Tag>
              )}
              disabled={isFetching}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              mode="multiple"
              placeholder="Outcome"
              className="w-full"
              value={outcomeFilter}
              onChange={setOutcomeFilter}
              options={OUTCOME_FILTER_OPTIONS}
              optionRender={({ label, color }) => (
                <Tag color={color}>{label}</Tag>
              )}
              disabled={isFetching}
            />
          </Col>
          <Col xs={24} md={6}>
            <RangePicker
              className="w-full"
              value={dateRange}
              onChange={setDateRange}
              disabled={isFetching}
            />
          </Col>
        </Row>

        <Divider className="my-4" />

        {/* Session List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading sessions..." />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <Text type="secondary">
              No sessions found matching your criteria
            </Text>
          </div>
        ) : (
          <>
            <List
              itemLayout="vertical"
              dataSource={filteredSessions}
              renderItem={(session) => (
                <Card
                  key={session._id}
                  className="mb-4 hover:shadow-md transition-all"
                  onClick={() => toggleExpandRow(session._id)}
                  bodyStyle={{ padding: 16 }}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Candidate Info */}
                    <div className="flex-1 flex items-start gap-4">
                      <Avatar
                        size={48}
                        src={session.applicationId?.photo}
                        icon={<UserOutlined />}
                        className="shadow-sm"
                      />
                      <div>
                        <Text strong className="block text-lg">
                          {session.applicationId?.name}
                        </Text>
                        <Text type="secondary" className="block">
                          {session.interviewRoundId?.name} • Round{" "}
                          {session.interviewRoundId?.roundNumber}
                        </Text>
                        <Text type="secondary" className="block">
                          {session.interviewRoundId?.passingScore || "NA"}% •
                          Passing Score{" "}
                        </Text>
                        <Space size="middle" className="mt-2">
                          <Text>
                            <CalendarOutlined className="mr-1" />
                            {dayjs(session.startTime).format("MMM D, YYYY")}
                          </Text>
                          <Text>
                            <ClockCircleOutlined className="mr-1" />
                            {dayjs(session.startTime).format("h:mm A")} -{" "}
                            {dayjs(session.endTime).format("h:mm A")}
                          </Text>
                        </Space>
                      </div>
                    </div>

                    {/* Status Controls */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <Select
                        value={session?.status}
                        onChange={(value) =>
                          handleStatusChange(session._id, false, value)
                        }
                        className="min-w-[150px]"
                        onClick={(e) => e.stopPropagation()}
                        disabled={statusMutation.isPending}
                      >
                        {STATUS_FILTER_OPTIONS.map(({ value, label, color }) => (
                          <Option key={value} value={value}>
                            <Tag color={color}>{label}</Tag>
                          </Option>
                        ))}
                      </Select>

                      {session?.status === "completed" && (
                        <>
                          <Select
                            value={session.outcome || "pending"}
                            onChange={(value) => {
                              handleStatusChange(session._id, true, value);
                            }}
                            className="min-w-[150px]"
                            onClick={(e) => e.stopPropagation()}
                            disabled={statusMutation.isPending}
                          >
                            {OUTCOME_FILTER_OPTIONS.map(
                              ({ value, label, color }) => (
                                <Option key={value} value={value}>
                                  <Tag color={color}>{label}</Tag>
                                </Option>
                              )
                            )}
                          </Select>

                          <Button
                            type={
                              expandedFeedback === session._id
                                ? "primary"
                                : "default"
                            }
                            icon={<StarOutlined />}
                            onClick={(e) => toggleFeedback(session, e)}
                            disabled={statusMutation.isPending}
                          >
                            {expandedFeedback === session._id
                              ? "Close Feedback"
                              : "Add Feedback"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Feedback Form */}
                  {expandedFeedback === session._id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-4 pt-4 border-t border-dashed"
                    >
                      <Form layout="vertical">
                        {session?.interviewRoundId?.questions &&
                          Array.isArray(session?.interviewRoundId?.questions) && (
                            <>
                              <Divider orientation="left">
                                Interview Questions
                              </Divider>
                              {session?.interviewRoundId?.questions.map(
                                (question, index) => {
                                  // Find existing answer for this question
                                  const existingAnswer = answer.find(
                                    (a) => a.questionId === question._id
                                  );

                                  return (
                                    <Form.Item
                                      key={question._id}
                                      label={`${index + 1}. ${
                                        question.questionText
                                      }`}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Please answer this question",
                                        },
                                      ]}
                                    >
                                      <Radio.Group
                                        value={existingAnswer?.answer}
                                        onChange={(e) =>
                                          handleAnswerChange(question, e)
                                        }
                                      >
                                        <Radio value={true}>Fit</Radio>
                                        <Radio value={false}>Unfit</Radio>
                                      </Radio.Group>
                                    </Form.Item>
                                  );
                                }
                              )}
                            </>
                          )}

                        <Form.Item label="Additional Comments">
                          <Input.TextArea
                            rows={4}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Provide detailed feedback about the candidate..."
                          />
                        </Form.Item>

                        <Collapse
                          activeKey={activeSkillPanel}
                          onChange={(key) => setActiveSkillPanel(key)}
                          ghost
                          className="bg-gray-50 rounded-lg p-2 mb-4"
                        >
                          <Panel
                            header={
                              <Text strong className="flex items-center">
                                <StarOutlined className="mr-2" />
                                Rate Skills (
                                {
                                  Object.keys(ratings).filter(
                                    (k) => ratings[k] > 0
                                  ).length
                                }
                                /{SKILLS_LIST.length})
                              </Text>
                            }
                            key="skills"
                          >
                            <Row gutter={[16, 16]}>
                              {SKILLS_LIST.map((skill) => (
                                <Col xs={24} md={12} key={skill}>
                                  <div className="flex items-center justify-between">
                                    <Text>{skill}</Text>
                                    <Rate
                                      value={ratings[skill] || 0}
                                      onChange={(value) =>
                                        handleRatingChange(skill, value)
                                      }
                                    />
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          </Panel>
                        </Collapse>

                        <div className="flex justify-end gap-2">
                          <Button 
                            onClick={() => setExpandedFeedback(null)}
                            disabled={statusMutation.isPending}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            loading={statusMutation.isPending}
                            onClick={() => handleSubmitFeedback(session._id)}
                          >
                            Submit Feedback
                          </Button>
                        </div>
                      </Form>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedRows.includes(session._id) && (
                    <div className="mt-4 pt-4 border-t">
                      <Descriptions
                        column={{ xs: 1, md: 2 }}
                        bordered
                        size="small"
                      >
                        <Descriptions.Item
                          label={
                            <>
                              <MailOutlined /> Email
                            </>
                          }
                        >
                          {session.applicationId?.email || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <>
                              <PhoneOutlined /> Phone
                            </>
                          }
                        >
                          {session.applicationId?.phone || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <>
                              <EnvironmentOutlined /> Location
                            </>
                          }
                        >
                          {session.applicationId?.currentLocation || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <>
                              <SolutionOutlined /> Position
                            </>
                          }
                        >
                          {session.applicationId?.position || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <>
                              <TeamOutlined /> Current Company
                            </>
                          }
                        >
                          {session.applicationId?.currentCompany || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <>
                              <BookOutlined /> Education
                            </>
                          }
                        >
                          {session.applicationId?.education || "-"}
                        </Descriptions.Item>
                        {session.notes && (
                          <Descriptions.Item label="Notes" span={2}>
                            {session.notes}
                          </Descriptions.Item>
                        )}
                        {session.interviewRoundId?.duration && (
                          <Descriptions.Item label="Duration" span={2}>
                            {session.interviewRoundId?.duration}
                          </Descriptions.Item>
                        )}
                        {session.meetingLink && (
                          <Descriptions.Item label="Meeting Link" span={2}>
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Join Meeting
                            </a>
                          </Descriptions.Item>
                        )}
                        {session.recordingLink && (
                          <Descriptions.Item label="Recording" span={2}>
                            <a
                              href={session.recordingLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Recording
                            </a>
                          </Descriptions.Item>
                        )}
                        {session.applicationId?.resume && (
                          <Descriptions.Item label="Resume" span={2}>
                            <a
                              href={`${import.meta.env.VITE_BACKEND_URL}${
                                session.applicationId.resume
                              }`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download Resume
                            </a>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </div>
                  )}
                </Card>
              )}
            />
            <div className="flex justify-center mt-4">
          <Pagination
  current={sessionsData?.pagination?.currentPage || pagination.current}
  pageSize={sessionsData?.pagination?.itemsPerPage || pagination.pageSize}
  total={sessionsData?.pagination?.totalItems || 0}
  onChange={handlePaginationChange}
  showSizeChanger
  showQuickJumper
  disabled={isFetching}
/>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default InterviewSessionManager;