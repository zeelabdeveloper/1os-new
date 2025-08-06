// src/pages/recruitment/ApplicationDetails.jsx
import React, { memo, useCallback, useState } from "react";
import {
  Card,
  Space,
  Tag,
  Button,
  Descriptions,
  Timeline,
  Avatar,
  Divider,
  Collapse,
  Form,
  Input,
  Typography,
  Row,
  Col,
  Select,
  Breadcrumb,
  Dropdown,
  Menu,
  Steps,
  Statistic,
  Progress,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  PhoneOutlined,
  UserOutlined,
  FileTextOutlined,
  MailOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  QuestionOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  RocketOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  MehOutlined,
  PauseOutlined,
  BarChartOutlined,
  ScheduleOutlined,
  TrophyOutlined,
  StarOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchApplicationById, updateApplicationStatus } from "../../api/jobs";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import InterviewSessionList from "../../components/InterviewSession/InterviewSessionList";
import InterviewSessionDetail from "../../components/InterviewSession/InterviewSessionDetail";
import AssignToManager from "./AssignToManager";

const { Panel } = Collapse;
const { Text, Title } = Typography;

const { Option } = Select;

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

    disabled: (app) => {
      // केवल enable हो अगर सभी completed interviews passed हैं
      const { completedInterviews, passedInterviews } =
        app?.interviewStatistics || {};
      return !(
        completedInterviews > 0 && completedInterviews === passedInterviews
      );
    },
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

const MemoizedInterviewSessionList = memo(InterviewSessionList);
const MemoizedInterviewSessionDetail = memo(InterviewSessionDetail);

const ApplicationDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const applicationId = queryParams.get("id");

  const [statusNotes, setStatusNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showStatusForm, setShowStatusForm] = useState(false);

  const {
    data: application,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["application", applicationId],
    queryFn: () => fetchApplicationById(applicationId),
    enabled: !!applicationId,
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      toast.success("Status updated successfully");
      refetch();
      setShowStatusForm(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update status");
    },
  });

  const handleStatusUpdate = () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    updateStatus({
      id: application._id,
      status: selectedStatus,
      notes: statusNotes,
    });
  };

  const [selectedSession, setSelectedSession] = useState(null);

  // Memoized handler to prevent recreating function on each render
  const handleSelectSession = useCallback((session) => {
    setSelectedSession(session);
  }, []);

  const handleEditComplete = useCallback(() => {
    setSelectedSession(null);
    refetch();
  }, []);

  const statusMenu = (
    <Menu>
      <AssignToManager application={application} />

      {console.log(application)}

      {Object.entries(statusConfig).map(([key, status]) => {
        const isDisabled = status.disabled?.(application) || false;
        return (
          <Menu.Item
            key={key}
            onClick={() => {
              if (!isDisabled) {
                setSelectedStatus(key);
                setShowStatusForm(true);
              }
            }}
            className={`flex items-center gap-2 ${
              isDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isDisabled}
          >
            <span
              className={`w-3 h-3 rounded-full`}
              style={{ backgroundColor: status.color }}
            />
            {status.title}
            {isDisabled && key === "onboarding" && (
              <span className="text-xs text-gray-500 ml-2">
                (Pass all interviews first)
              </span>
            )}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  // Onboarding Button को भी update करें
  <Dropdown
    overlay={statusMenu}
    placement="bottomRight"
    disabled={statusConfig.onboarding.disabled?.(application)}
  >
    <Button
      type="primary"
      icon={<RocketOutlined />}
      className="flex items-center"
      disabled={statusConfig.onboarding.disabled?.(application)}
    >
      Move to Onboarding
    </Button>
  </Dropdown>;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );

  if (!application)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <Title level={4} className="text-gray-600">
            Application not found
          </Title>
          <Button
            type="primary"
            onClick={() => navigate("/recruitment/applications")}
          >
            Back to Applications
          </Button>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 overflow-y-scroll h-[92vh]">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item
          onClick={() => navigate("/recruitment/jobs")}
          className="cursor-pointer hover:text-blue-500"
        >
          <HomeOutlined className="mr-2" /> Recruitment
        </Breadcrumb.Item>
        <Breadcrumb.Item
          onClick={() => navigate("/recruitment/applications")}
          className="cursor-pointer hover:text-blue-500"
        >
          Applications
        </Breadcrumb.Item>
        <Breadcrumb.Item className="text-gray-600">
          Application Details
        </Breadcrumb.Item>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/recruitment/applications")}
          className="flex items-center text-gray-600 hover:text-blue-500"
        >
          Back to Applications
        </Button>

        <div className="flex gap-2">
          <Dropdown overlay={statusMenu} placement="bottomRight">
            <Button
              type="primary"
              icon={<EditOutlined />}
              className="flex items-center"
            >
              Update Status
            </Button>
          </Dropdown>
        </div>
      </div>

      {application?.status === "interview_round" && (
        <MemoizedInterviewSessionList
          refetchAppliction={() => refetch()}
          onSelectSession={handleSelectSession}
        />
      )}
      {selectedSession && (
        <MemoizedInterviewSessionDetail
          sessionId={selectedSession._id}
          onEdit={handleEditComplete}
        />
      )}

      {/* Interview Statistics Section */}
      {application?.interviewStatistics &&
        Array.isArray(application?.interviewDetails) &&
        application?.interviewDetails.length > 0 && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <BarChartOutlined className="text-blue-500" />
                <span>Interview Performance</span>
              </div>
            }
            className="mb-6 shadow-md border-0 rounded-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Statistic
                title="Total Interviews"
                value={application.interviewStatistics.totalInterviews}
                prefix={<ScheduleOutlined />}
                valueStyle={{ color: "#3b82f6" }}
              />
              <Statistic
                title="Completed"
                value={application.interviewStatistics.completedInterviews}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#10b981" }}
              />
              <Statistic
                title="Passed"
                value={application.interviewStatistics.passedInterviews}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: "#10b981" }}
              />
              <Statistic
                title="Success Rate"
                value={`${application.interviewStatistics.overallPercentage}%`}
                prefix={<StarOutlined />}
                valueStyle={{ color: "#f59e0b" }}
              />
            </div>

            <Divider />

            <Title level={5} className="mb-4 flex items-center gap-2">
              <BarChartOutlined className="text-blue-500" />
              Detailed Round Performance
            </Title>

            <div className="space-y-4">
              {Array.isArray(application?.interviewDetails) &&
                application?.interviewDetails?.map((round, index) => (
                  <Card key={index} className="border-0 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag color="blue">Round {round.roundNumber}</Tag>
                          <Text strong>{round.roundName}</Text>
                        </div>
                        <div className="flex items-center gap-4">
                          <Avatar
                            size="small"
                            src={round.interviewer?.avatar}
                            icon={<UserOutlined />}
                          />
                          <Text>{round?.interviewer?.name}</Text>
                        </div>
                      </div>

                      <div className="flex-1">
                        <Progress
                          percent={round.percentage}
                          status={
                            round.percentage >= round.passingScore
                              ? "success"
                              : "exception"
                          }
                          format={(percent) => (
                            <span className="text-sm">
                              {percent}%
                              {/* {percent}% ({round.rightQuestions}/{round.totalPossibleMarks}) */}
                            </span>
                          )}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Passing: {round?.passingScore}%</span>
                          <span>
                            Status:{" "}
                            <Tag
                              color={
                                round.status === "passed" ? "green" : "red"
                              }
                            >
                              {round.status}
                            </Tag>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </Card>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Candidate Profile Card */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
            <div className="flex flex-col items-center py-6">
              <Avatar
                src={application?.avatar || null}
                size={120}
                icon={!application?.avatar && <UserOutlined />}
                className="border-4 border-white shadow-md"
              />
              <Title level={4} className="mt-4 mb-1">
                {application.name}
              </Title>
              <Tag
                color={statusConfig[application.status]?.color}
                className="rounded-full px-3 py-1 flex items-center gap-1"
              >
                {statusConfig[application.status]?.icon}
                {statusConfig[application.status]?.title}
              </Tag>

              <Divider className="my-4 w-full" />

              <div className="w-full space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Applied for:</span>
                  <span className="font-medium text-right">
                    {application.jobId?.title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">
                    {application.jobId?.location}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Applied on:</span>
                  <span className="font-medium">
                    {dayjs(application.appliedAt).format("MMM D, YYYY")}
                  </span>
                </div>
              </div>

              <Divider className="my-4 w-full" />

              <div className="w-full space-y-2">
                <Button
                  type="text"
                  icon={<MailOutlined />}
                  block
                  className="text-left flex items-center text-gray-700 hover:text-blue-500"
                  href={`mailto:${application.email}`}
                >
                  {application.email}
                </Button>
                <Button
                  type="text"
                  icon={<PhoneOutlined />}
                  block
                  className="text-left flex items-center text-gray-700 hover:text-blue-500"
                >
                  {application.phone}
                </Button>
                {application.resume && (
                  <Button
                    type="text"
                    icon={<FileTextOutlined />}
                    block
                    className="text-left flex items-center text-gray-700 hover:text-blue-500"
                    href={`${import.meta.env.VITE_BACKEND_URL}${
                      application.resume
                    }`}
                    target="_blank"
                  >
                    View Resume
                  </Button>
                )}
              </div>
            </div>
          </Card>





          
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Status Update Form (Conditional) */}
          {showStatusForm && (
            //             <Card className="shadow-md border-0 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
            //               <Form layout="vertical">
            //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            //                   <Form.Item label="New Status" className="md:col-span-1">
            //                     <Select
            //                       placeholder="Select status"
            //                       value={selectedStatus}
            //                       onChange={(value) => setSelectedStatus(value)}
            //                       className="w-full"
            //                     >
            //                       {Object.entries(statusConfig).map(([key, status]) => (
            //                         <Option key={key} value={key}>
            //                           <div className="flex items-center gap-2">
            //                             <span
            //                               className={`w-3 h-3 rounded-full`}
            //                               style={{ backgroundColor: status.color }}
            //                             />
            //                             {status.title}
            //                           </div>
            //                         </Option>
            //                       ))}
            //                     </Select>
            //                   </Form.Item>

            //  <Form.Item label="Notes" className="md:col-span-2">
            //   <Input.TextArea
            //     placeholder="Notes"
            //     autoSize={{ minRows: 1, maxRows: 5 }}
            //     style={{ width: 'fit-content', maxWidth: '100%' }}
            //   />
            // </Form.Item>

            //                   <Form.Item label="Action" className="md:col-span-2">
            //                     <div className="flex gap-2">
            //                       <Button
            //                         type="primary"
            //                         onClick={handleStatusUpdate}
            //                         disabled={!selectedStatus}
            //                         loading={isPending}
            //                         className="flex-shrink-0"
            //                       >
            //                         Update
            //                       </Button>
            //                       <Button
            //                         onClick={() => {
            //                           setShowStatusForm(false);
            //                           setSelectedStatus("");
            //                           setStatusNotes("");
            //                         }}
            //                         className="flex-shrink-0"
            //                       >
            //                         Cancel
            //                       </Button>
            //                     </div>
            //                   </Form.Item>
            //                 </div>
            //               </Form>
            //             </Card>











            
            <Card className="shadow-md border-0 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
              <Form layout="vertical">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  {/* New Status */}
                  <Form.Item label="New Status">
                    <Select
                      placeholder="Select status"
                      value={selectedStatus}
                      onChange={(value) => setSelectedStatus(value)}
                      className="w-full"
                    >
                      {Object.entries(statusConfig).map(([key, status]) => (
                        <Option key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: status.color }}
                            />
                            {status.title}
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* Notes */}
                  <Form.Item label="Notes">
                    <Input.TextArea
                      placeholder="Notes"
                      autoSize={{ minRows: 1, maxRows: 5 }}
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                    />
                  </Form.Item>

                  {/* Action Buttons */}
                  <Form.Item label="Action">
                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        onClick={handleStatusUpdate}
                        disabled={!selectedStatus}
                        loading={isPending}
                        className="flex-shrink-0"
                      >
                        Update
                      </Button>
                      <Button
                        onClick={() => {
                          setShowStatusForm(false);
                          setSelectedStatus("");
                          setStatusNotes("");
                        }}
                        className="flex-shrink-0"
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form.Item>
                </div>
              </Form>
            </Card>
          )}


  {application?.managerReview?.assignedAt &&
            application?.managerReview?.reviewedBy && (
              <Card
                title="Manager Feedback"
                bordered={false}
                style={{ marginBottom: 24 }}
                headStyle={{ backgroundColor: "#f0f2f5" }}
              >
                <Descriptions column={1} bordered>
                  <Descriptions.Item
                    label={
                      <span>
                        <ScheduleOutlined style={{ marginRight: 8 }} />
                        Assigned At
                      </span>
                    }
                  >
                    <Tag color="blue">
                      {dayjs(application.managerReview.assignedAt).format(
                        "DD MMM YYYY, hh:mm A"
                      )}
                    </Tag>
                  </Descriptions.Item>

                  {application.managerReview.feedbackAt && (
                    <Descriptions.Item
                      label={
                        <span>
                          <ScheduleOutlined style={{ marginRight: 8 }} />
                          Feedback At
                        </span>
                      }
                    >
                      <Tag color="green">
                        {dayjs(application.managerReview.feedbackAt).format(
                          "DD MMM YYYY, hh:mm A"
                        )}
                      </Tag>
                    </Descriptions.Item>
                  )}

                  {application.managerReview.feedbackAt && (
                    <Descriptions.Item
                      label={
                        <span>
                          <UserOutlined style={{ marginRight: 8 }} />
                          Reviewed By
                        </span>
                      }
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {application?.managerReview?.reviewedBy?.firstName}{" "}
                        {application?.managerReview?.reviewedBy?.lastName}
                        {application.managerReview?.reviewedBy?.email && (
                          <>
                            <MailOutlined
                              style={{ marginLeft: 16, marginRight: 4 }}
                            />
                            <span style={{ color: "#1890ff" }}>
                              {application?.managerReview?.reviewedBy.email}
                            </span>
                          </>
                        )}
                      </div>
                    </Descriptions.Item>
                  )}

                  {application.managerIdForReview &&
                    !application.managerReview.feedbackAt && (
                      <Descriptions.Item
                        label={
                          <span>
                            <UserOutlined style={{ marginRight: 8 }} />
                            Assigned Manager
                          </span>
                        }
                      >
                        {application.managerIdForReview.firstName}{" "}
                        {application.managerIdForReview.lastName}
                      </Descriptions.Item>
                    )}

                  {application.managerReview.note && (
                    <Descriptions.Item
                      label={
                        <span>
                          <FileTextOutlined style={{ marginRight: 8 }} />
                          Note
                        </span>
                      }
                    >
                      {application.managerReview.note}
                    </Descriptions.Item>
                  )}

                  {application.managerReview.status && (
                    <Descriptions.Item
                      label={
                        <span>
                          <SolutionOutlined style={{ marginRight: 8 }} />
                          Status
                        </span>
                      }
                    >
                      <Tag
                        color={
                          application.managerReview.status === "selected"
                            ? "green"
                            : application.managerReview.status === "rejected"
                            ? "red"
                            : application.managerReview.status === "on_hold"
                            ? "orange"
                            : "default"
                        }
                      >
                        {application.managerReview.status.toUpperCase()}
                      </Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}






          {/* Candidate Details */}
          <Card className="shadow-md border-0 rounded-xl">
            <Title level={5} className="mb-4 flex items-center gap-2">
              <UserOutlined className="text-blue-500" />
              Candidate Information
            </Title>









            <Descriptions column={2} className="custom-descriptions" bordered>
              {/* Personal Information */}
              <Descriptions.Item label="Gender">
                {application.gender === "male" ? (
                  <Tag
                    icon={<ManOutlined />}
                    color="blue"
                    className="rounded-full"
                  >
                    Male
                  </Tag>
                ) : application.gender === "female" ? (
                  <Tag
                    icon={<WomanOutlined />}
                    color="pink"
                    className="rounded-full"
                  >
                    Female
                  </Tag>
                ) : (
                  <Tag icon={<QuestionOutlined />} className="rounded-full">
                    Other
                  </Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Phone Number">
                {application.phone || "Not specified"}
              </Descriptions.Item>

              {/* Location Information */}
              <Descriptions.Item label="Current Location" span={2}>
                {application.currentLocation || "Not specified"}
              </Descriptions.Item>

              {/* Professional Information */}
              <Descriptions.Item label="Division" span={2}>
                {application.division || "Not specified"}
              </Descriptions.Item>

              <Descriptions.Item label="Position" span={2}>
                {application.position || "Not specified"}
              </Descriptions.Item>

              <Descriptions.Item label="Zone" span={2}>
                {application.zone || "Not specified"}
              </Descriptions.Item>

              {/* Career Information */}
              <Descriptions.Item label="Salary" span={2}>
                {application.salary
                  ? `$${application.salary}`
                  : "Not specified"}
              </Descriptions.Item>

              <Descriptions.Item label="Experience" span={2}>
                {application.experience
                  ? `${application.experience} years`
                  : "Not specified"}
              </Descriptions.Item>

              {/* Education & Company */}
              <Descriptions.Item label="Education" span={2}>
                {application.education || "Not specified"}
              </Descriptions.Item>

              <Descriptions.Item label="Current Company" span={2}>
                {application.currentCompany || "Not specified"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Application Content */}
          <Card className="shadow-md border-0 rounded-xl">
            <Title level={5} className="mb-4 flex items-center gap-2">
              <FileTextOutlined className="text-blue-500" />
              Application Content
            </Title>

            <Collapse
              bordered={false}
              defaultActiveKey={["1", "2"]}
              className="bg-transparent"
            >
              <Panel
                header={
                  <span className="font-medium text-gray-800">
                    Cover Letter
                  </span>
                }
                key="1"
                className={`bg-blue-50 border border-blue-200 rounded-lg mb-2`}
              >
                <div className="p-4 bg-white rounded-lg">
                  {application.coverLetter || "No cover letter provided"}
                </div>
              </Panel>
              <Panel
                header={
                  <span className="font-medium text-gray-800">
                    Candidate Weaknesses
                  </span>
                }
                key="2"
                className={`bg-blue-50 border border-blue-200 rounded-lg`}
              >
                <div className="p-4 bg-white rounded-lg">
                  {application.weaknesses || "Not specified"}
                </div>
              </Panel>
            </Collapse>
          </Card>

        

          {/* Timeline */}
          <Card className="shadow-md border-0 rounded-xl">
            <Title level={5} className="mb-4 flex items-center gap-2">
              <CalendarOutlined className="text-blue-500" />
              Application Timeline
            </Title>

            <div className="relative">
              <div className="absolute left-4 h-full w-0.5 bg-gray-200 transform -translate-x-1/2"></div>

              <div className="space-y-6">
                <div className="relative pl-10">
                  <div className="absolute left-4 w-3 h-3 rounded-full bg-blue-500 transform -translate-x-1/2 mt-1.5"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <Text strong className="text-gray-800">
                        Application Submitted
                      </Text>
                      <div className="text-gray-500 text-sm">
                        {dayjs(application.appliedAt).format(
                          "MMM D, YYYY h:mm A"
                        )}
                      </div>
                    </div>
                    <Tag color="blue" className="mt-2 sm:mt-0">
                      Applied
                    </Tag>
                  </div>
                </div>

                {application.history?.map((item, index) => (
                  <div key={index} className="relative pl-10">
                    <div
                      className={`absolute left-4 w-3 h-3 rounded-full transform -translate-x-1/2 mt-1.5`}
                      style={{
                        backgroundColor: statusConfig[item.status]?.color,
                      }}
                    ></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div>
                        <Text strong className="text-gray-800">
                          {statusConfig[item.status]?.title || item.status}
                        </Text>
                        <div className="text-gray-500 text-sm">
                          {dayjs(item.date).format("MMM D, YYYY h:mm A")}
                        </div>
                        {item.notes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                            {item.notes}
                          </div>
                        )}
                      </div>
                      <Tag
                        color={statusConfig[item.status]?.color}
                        className="mt-2 sm:mt-0"
                      >
                        {statusConfig[item.status]?.title}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
