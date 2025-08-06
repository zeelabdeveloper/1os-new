import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Statistic, 
  Row, 
  Col, 
  DatePicker, 
  Input, 
  Select, 
  Skeleton,
  Button,
  Divider
} from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  SyncOutlined,
  CalendarOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import axiosInstance from '../../axiosConfig';
import {debounce} from 'lodash'
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;
const { Option } = Select;

const statusColors = {
  scheduled: 'blue',
  in_progress: 'orange',
  completed: 'green',
  cancelled: 'red',
  rescheduled: 'purple'
};

const outcomeColors = {
  selected: 'green',
  rejected: 'red',
  hold: 'orange',
  pending: 'blue'
};

const statusIcons = {
  scheduled: <ClockCircleOutlined />,
  in_progress: <SyncOutlined spin />,
  completed: <CheckCircleOutlined />,
  cancelled: <CloseCircleOutlined />,
  rescheduled: <CalendarOutlined />
};

const OngoingInterviewListFromApplicationCreator = ({ createdBy }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [statusFilter, setStatusFilter] = useState(null);
 
  const [candidateFilter, setCandidateFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [sortField, setSortField] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');




const [inputValue, setInputValue] = useState('');






 const debouncedSearch = useCallback(
    debounce((value) => {
      setCandidateFilter(value);
      // This will trigger your API call through useQuery
    }, 500),
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle input changes
  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value); // Immediate UI update
    debouncedSearch(value); // Debounced API update
  };












  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['interviewStats', createdBy],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/v1/interview/interviewSessions/stats/${createdBy}`);
      return response.data;
    }
  });

  // Fetch interview sessions
  const { 
    data: interviews, 
    isLoading: interviewsLoading,
      
  } = useQuery({
    queryKey: [
      'interviewSessions', 
      createdBy, 
      page, 
      pageSize, 
      statusFilter, 
  
      candidateFilter, 
      dateRange, 
      sortField, 
      sortOrder
    ],
    queryFn: async () => {
      let url = `/api/v1/interview/interviewSessions/sessionList/${createdBy}?page=${page}&limit=${pageSize}&sortField=${sortField}&sortOrder=${sortOrder}`;
      
      if (statusFilter) url += `&status=${statusFilter}`;
      
      if (candidateFilter) url += `&candidateName=${candidateFilter}`;
      if (dateRange) {
        url += `&startDate=${dateRange[0].format('YYYY-MM-DD')}&endDate=${dateRange[1].format('YYYY-MM-DD')}`;
      }
      
      const response = await axiosInstance.get(url);
      return response.data;
    }
  });

 


  const handleTableChange = (pagination,  sorter) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  const resetFilters = () => {
    setStatusFilter(null);
   
    setCandidateFilter('');
    setDateRange(null);
    setPage(1);
    setSortField('updatedAt');
    setSortOrder('desc');
  };

  const columns = [
    {
      title: 'Candidate',
      dataIndex: ['applicationId', 'name'],
      key: 'candidate',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.applicationId?.email}</div>
        </div>
      ),
      sorter: true
    },
    {
      title: 'Interview Round',
      dataIndex: ['interviewRoundId', 'name'],
      key: 'round',
      sorter: true
    },
    {
      title: 'Interviewer',
      dataIndex: ['interviewer', 'firstName'],
      key: 'interviewer',
     render: (firstName, record) => (
        <div>
         {console.log(record)}
{firstName}

        </div>
      ),
    },
 {
  title: 'JOB',
  dataIndex: ['applicationId', 'jobId', 'title'],
  key: 'JOB',
  render: (text, record) => {
    // If you need to handle cases where data might be missing
    const jobTitle = record?.applicationId?.jobId?.title || 'N/A';
    return <div>{jobTitle}</div>;
  },
},




{
  title: 'Position',
  dataIndex: ['applicationId',  'position'],
  key: 'position',
  render: (text, record) => {
    // If you need to handle cases where data might be missing
    const jobTitle = record?.applicationId?.position || 'N/A';
    return <div>{jobTitle}</div>;
  },
}
,






    {
      title: 'Schedule',
      dataIndex: 'startTime',
      key: 'schedule',
      render: (date, record) => (
        <div>
          <div>{dayjs(date).format('DD MMM YYYY')}</div>
          <div style={{ fontSize: 12 }}>
            {dayjs(date).format('h:mm A')} - {dayjs(record.endTime).format('h:mm A')}
          </div>
        </div>
      ),
      sorter: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag icon={statusIcons[status]} color={statusColors[status]}>
          {   status==='in_progress'? 'Not Answering' :    status.replace('_', ' ')}
        </Tag>
      ),
      sorter: true
    },
    {
      title: 'Outcome',
      dataIndex: 'outcome',
      key: 'outcome',
      render: (outcome) => (
        <Tag color={outcomeColors[outcome]}>
          {outcome}
        </Tag>
      ),
      sorter: true
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => dayjs(date).format('DD MMM YYYY h:mm A'),
      sorter: true,
      defaultSortOrder: 'descend'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
            
          <Button size="small" onClick={()=>window.location.href=`/recruitment/application?id=${record?.applicationId?._id}`}   >View</Button>
         
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Ongoing Interviews</h2>
      
      {/* Stats Cards */}
      <Skeleton loading={statsLoading} active>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic 
                title="Total Interviews" 
                value={stats?.total || 0} 
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic 
                title="Scheduled" 
                value={stats?.scheduled || 0} 
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic 
                title="In Progress" 
                value={stats?.in_progress || 0} 
                prefix={<SyncOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic 
                title="Completed" 
                value={stats?.completed || 0} 
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic 
                title="Cancelled" 
                value={stats?.cancelled || 0} 
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic 
                title="Rescheduled" 
                value={stats?.rescheduled || 0} 
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Skeleton>
      
      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
          <Input
            placeholder="Search Interviwer"
            prefix={<UserOutlined />}
            suffix={<SearchOutlined />}
        value={inputValue}
      onChange={handleChange}
            style={{ width: 200 }}
          />
          
          <Select
            placeholder="Filter by status"
            style={{ width: 200 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="scheduled">Scheduled</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="rescheduled">Rescheduled</Option>
          </Select>
          
          
          <RangePicker 
            showTime 
            format="YYYY-MM-DD"
            onChange={(dates) => setDateRange(dates)}
            value={dateRange}
          />
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={resetFilters}
          >
            Reset
          </Button>
        </Space>
      </Card>
      
      {/* Interview Sessions Table */}
      <Card>
        <Skeleton loading={interviewsLoading} active>
          {/* <Table
            columns={columns}
            dataSource={interviews?.docs || []}
            rowKey="_id"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: interviews?.totalDocs || 0,
              showSizeChanger: true,
              pageSizeOptions: ['5','10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
          /> */}







<Table
  columns={columns}
  dataSource={interviews?.docs || []}
  rowKey="_id"
  pagination={{
    current: interviews?.page || 1,
    pageSize: interviews?.limit || 10,
    total: interviews?.total || 0,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50', '100'],
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    showQuickJumper: true,
    position: ['bottomRight']
  }}
  onChange={handleTableChange}
  scroll={{ x: true }}
  loading={interviewsLoading}
/>




        </Skeleton>
      </Card>
    </div>
  );
};

export default OngoingInterviewListFromApplicationCreator;