import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Select,
  Card,
  Popconfirm,
  Avatar,
  Typography,
  Badge,
  Descriptions,
  Row,
  Col,
  Divider,
  Progress,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import InterviewSessionForm from "./InterviewSessionForm";
import toast from "react-hot-toast";

const { Text } = Typography;
const { Option } = Select;

// Memoized components to prevent unnecessary re-renders
const MemoizedAvatar = React.memo(Avatar);
const MemoizedTag = React.memo(Tag);
const MemoizedButton = React.memo(Button);
const MemoizedText = React.memo(Text);

const getCandidateIdFromUrl = () => {
  const query = new URLSearchParams(window.location.search);
  return query.get("id");
};

const fetchInterviewSessions = async (candidateId) => {
  const { data } = await axios.get(
    `/api/v1/interview/interviewSessions/${candidateId}`
  );
  return data;
};

const deleteInterviewSession = async (id) => {
  await axios.delete(`/api/v1/interview/interviewSessions/${id}`);
};

const updateInterviewStatus = async ({ id, status, isOutCome }) => {
  const { data } = await axios.patch(
    `/api/v1/interview/interviewSessions/${id}`,
    { status, isOutCome }
  );
  return data;
};

const InterviewSessionList = ({refetchAppliction= ()=>{}}) => {
  const candidateId = useMemo(() => getCandidateIdFromUrl(), []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Query for interview sessions
  const {
    data: sessions = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["interviewSessions", candidateId],
    queryFn: () => fetchInterviewSessions(candidateId),
    staleTime: 500,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteInterviewSession,
    onSuccess: () => {
      toast.success("Interview session deleted successfully");
      refetch();
      refetchAppliction()
    },
    onError: () => {
      toast.error("Failed to delete interview session");
    },
  });

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  const ViewFeedBack = (feedbackData) => {
    setCurrentFeedback(feedbackData);
    setFeedbackModalVisible(true);
  };

  const calculateTotalScore = (answers) => {
    if (!answers || answers.length === 0) return 0;

    const totalPossible = answers.reduce((sum, a) => sum + a.weightage, 0);
    const earned = answers.reduce(
      (sum, a) => sum + (a.isCorrect ? a.weightage : 0),
      0
    );

    return Math.round((earned / totalPossible) * 100);
  };

  const statusMutation = useMutation({
    mutationFn: updateInterviewStatus,
    onSuccess: (s) => {
      toast.success(s.message || "Status updated successfully");
      queryClient.invalidateQueries(["interviewSessions", candidateId]);
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  // Memoized handlers
  const handleStatusChange = useCallback(
    (id, newStatus, isOutCome) => {
      statusMutation.mutate({ id, status: newStatus, isOutCome });
    },
    [statusMutation]
  );

  const handleEdit = useCallback((session) => {
    setSelectedSession(session);
    setIsModalVisible(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedSession(null);
    setIsModalVisible(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  // Memoized status and outcome tag components
  const getStatusTag = useCallback(
    (status, record) => {
      const statusMap = {
        scheduled: { color: "blue", icon: <ClockCircleOutlined /> },
        in_progress: { color: "orange", icon: <ClockCircleOutlined /> },
        completed: { color: "green", icon: <CheckCircleOutlined /> },
        cancelled: { color: "red", icon: <CloseCircleOutlined /> },
        rescheduled: { color: "purple", icon: <ExclamationCircleOutlined /> },
      };

      return (
        <Select
          defaultValue={status==='in_progress' ? "Not Answering" : status  }
          style={{ width: 150 }}
          onChange={(value) => handleStatusChange(record._id, value)}
          bordered={false}
        >
           
        </Select>
      );
    },
    [handleStatusChange]
  );

  const getOutcomeTag = useCallback(
    (outcome, record) => {
      const outcomeMap = {
        selected: { color: "success", text: "Selected" },
        rejected: { color: "error", text: "Rejected" },
        hold: { color: "warning", text: "On Hold" },
        pending: { color: "default", text: "Pending" },
      };

      return (
        <Select
          defaultValue={outcome}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record._id, value, true)}
          bordered={false}
        >
          {/* {Object.keys(outcomeMap).map((key) => (
          <Option key={key} value={key}>
            <Badge status={outcomeMap[key].color} text={outcomeMap[key].text} />
          </Option>
        ))} */}
        </Select>
      );
    },
    [handleStatusChange]
  );

  // Memoized table columns
  const columns = useMemo(
    () => [
      {
        title: "Candidate",
        dataIndex: ["application", "name"],
        key: "candidate",
        render: (text, record) => (
          <Space>
            <MemoizedAvatar
              src={record.applicationId?.photo}
              icon={<UserOutlined />}
            />
            <div>
              <MemoizedText strong>{record.applicationId?.name}</MemoizedText>
              <br />
              <MemoizedText type="secondary">
                {record.applicationId?.email}
              </MemoizedText>
            </div>
          </Space>
        ),
      },
      {
        title: "Interview Round",
        dataIndex: ["interviewRound", "name"],
        key: "round",
        render: (text, record) => (
          <div>
            <MemoizedText strong>{record.interviewRoundId?.name}</MemoizedText>
            <br />
            <MemoizedText type="secondary">
              Round {record.interviewRoundId?.roundNumber}
            </MemoizedText>
          </div>
        ),
      },
      {
        title: "Interviewer",
        dataIndex: ["interviewer", "fullName"],
        key: "interviewer",
        render: (text) => (
          <MemoizedTag icon={<UserOutlined />}>{text}</MemoizedTag>
        ),
      },
      {
        title: "Schedule",
        dataIndex: "startTime",
        key: "schedule",
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <MemoizedText>
              <CalendarOutlined />{" "}
              {dayjs(record.startTime).format("DD MMM YYYY")}
            </MemoizedText>
            <MemoizedText type="secondary">
              {dayjs(record.startTime).format("h:mm A")} -{" "}
              {dayjs(record.endTime).format("h:mm A")}
            </MemoizedText>
            {record.meetingLink && (
              <a
                href={record.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Meeting
              </a>
            )}
          </Space>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status, record) => getStatusTag(status, record),
      },
      {
        title: "Outcome",
        dataIndex: "outcome",
        key: "outcome",
        render: (outcome, record) => getOutcomeTag(outcome, record),
      },
      {
        title: "Actions",
        key: "actions",
        fixed: "right",
        render: (_, record) => (
          <Space size="middle">
            <MemoizedButton
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
            <Popconfirm
              title="Are you sure to delete this session?"
              onConfirm={() => deleteMutation.mutate(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <MemoizedButton type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>

            <Popconfirm
              title="Are you sure to view FeedBack?"
              onConfirm={() => ViewFeedBack(record)}
              okText="Yes"
              cancelText="No"
            >
              <MemoizedButton type="link" danger icon={<EyeOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [getStatusTag, getOutcomeTag, handleEdit, deleteMutation]
  );

  return (
    <div className="">
      <Modal
        title="Interview Feedback Details"
        visible={feedbackModalVisible}
        onCancel={() => setFeedbackModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setFeedbackModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {console.log(currentFeedback)}
        {currentFeedback && (
          <div style={{ marginTop: 20 }}>
            <Card title="Round Details" style={{ marginBottom: 16 }}>
              <Descriptions column={2}>
                <Descriptions.Item label="Round Name">
                  {currentFeedback?.interviewRoundId?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Round Number">
                  Round {currentFeedback?.interviewRoundId?.roundNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Interviewer">
                  {currentFeedback?.interviewer?.fullName || currentFeedback?.interviewer?.firstName }
                </Descriptions.Item>
                <Descriptions.Item label="Outcome">
                  <Tag
                    color={
                      currentFeedback?.outcome === "selected"
                        ? "green"
                        : currentFeedback?.outcome === "rejected"
                        ? "red"
                        : "orange"
                    }
                  >
                    {currentFeedback.outcome}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Notes" style={{ marginBottom: 16 }}>
              {currentFeedback?.notes ? (
                <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
                  {currentFeedback?.notes}
                </Typography.Paragraph>
              ) : (
                <Typography.Text type="secondary">
                  No notes provided
                </Typography.Text>
              )}
            </Card>

            <Card title="Feedback" style={{ marginBottom: 16 }}>
              {currentFeedback?.comments ? (
                <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
                  {currentFeedback.comments}
                </Typography.Paragraph>
              ) : (
                <Typography.Text type="secondary">
                  No comments provided
                </Typography.Text>
              )}
            </Card>

            {currentFeedback?.ratings && (
              <Card title="Ratings">
                <Row gutter={[16, 16]}>
                  {Object.entries(currentFeedback?.ratings).map(
                    ([category, score]) => (
                      <Col span={12} key={category}>
                        <div>
                          <Typography.Text strong>{category}:</Typography.Text>
                          <Progress
                            percent={(score / 5) * 100}
                            format={() => `${score}/5`}
                            strokeColor={
                              score >= 4
                                ? "#52c41a"
                                : score >= 3
                                ? "#faad14"
                                : "#ff4d4f"
                            }
                          />
                        </div>
                      </Col>
                    )
                  )}
                </Row>
              </Card>
            )}

            {currentFeedback?.answer && (
              <Card title="Interview Questions & Answers">
                <Row gutter={[16, 16]}>
                  {currentFeedback.answer.map((answer, index) => (
                    <Col span={24} key={answer.questionId || index}>
                      <Card
                        size="small"
                        type="inner"
                        title={`Question ${index + 1}: ${answer.questionText}`}
                        extra={
                          <Tag color={answer.isCorrect ? "green" : "red"}>
                            {answer.isCorrect ? "Correct" : "Incorrect"}
                          </Tag>
                        }
                      >
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="Weightage">
                            {answer.weightage}%
                          </Descriptions.Item>
                          <Descriptions.Item label="Expected Answer">
                            {answer.expectedAnswer ? "True" : "False"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Candidate's Answer">
                            <Tag
                              color={
                                answer.answer === answer.expectedAnswer
                                  ? "green"
                                  : "red"
                              }
                            >
                              {answer.answer ? "True" : "False"}
                            </Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="Score">
                            <Progress
                              percent={answer.isCorrect ? 100 : 0}
                              format={() =>
                                answer.isCorrect
                                  ? `${answer.weightage}/${answer.weightage}`
                                  : `0/${answer.weightage}`
                              }
                              strokeColor={
                                answer.isCorrect ? "#52c41a" : "#ff4d4f"
                              }
                            />
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Optional: Total Score Summary */}

                <Divider />
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <Typography.Title level={4}>
                    Total Score: {calculateTotalScore(currentFeedback.answer)}%
                  </Typography.Title>

                  {parseFloat(calculateTotalScore(currentFeedback?.answer)) >=
                  parseFloat(
                    currentFeedback?.interviewRoundId?.passingScore
                  ) ? (
                    <Typography.Text type="success" strong>
                      ✅ Passed — Candidate is eligible for onboarding.
                    </Typography.Text>
                  ) : (
                    <Typography.Text type="danger" strong>
                      ❌ Failed — Candidate is not eligible for onboarding.
                    </Typography.Text>
                  )}
                </div>
              </Card>
            )}

            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Typography.Text type="secondary">
                Last updated:{" "}
                {dayjs(currentFeedback?.updatedAt).format(
                  "DD MMM YYYY hh:mm A"
                )}
              </Typography.Text>
            </div>
          </div>
        )}
      </Modal>

      <Card
        title="Interview Sessions"
        extra={
          <MemoizedButton type="primary" onClick={handleCreate}>
            Schedule New Session
          </MemoizedButton>
        }
      >
        <Table
          columns={columns}
          dataSource={Array.isArray(sessions) ? sessions : []}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1300 }}
          bordered
        />
      </Card>

      <Modal
        title={selectedSession ? "Edit Session" : "New Session"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <InterviewSessionForm
          session={selectedSession}
          onSuccess={() => {
            setIsModalVisible(false);
            refetch();
            refetchAppliction()
          }}
        />
      </Modal>
    </div>
  );
};

export default React.memo(InterviewSessionList);
