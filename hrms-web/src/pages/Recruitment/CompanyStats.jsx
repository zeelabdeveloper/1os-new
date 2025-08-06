// import React from "react";
// import { Card, Row, Col, Statistic, Table, Tag, Spin, Typography } from "antd";
// import {
//   ArrowUpOutlined,
//   UserOutlined,
//   CheckCircleOutlined,
//   CloseCircleOutlined,
//   ClockCircleOutlined,
//   TeamOutlined,
//   EyeFilled,
//   EyeOutlined,
// } from "@ant-design/icons";
// import { useQuery } from "@tanstack/react-query";
// import axios from "../../axiosConfig";
// import { toast } from "react-hot-toast";
// import Chart from "react-apexcharts";

// const { Title } = Typography;

// const statusColors = {
//   applied: "blue",
//   onboarding: "purple",
//   onboarded: "green",
//   interview_round: "orange",
//   rejected: "red",
//   on_hold: "gold",
//   telephonic: "cyan",
// };

// const statusIcons = {
//   applied: <ClockCircleOutlined />,
//   onboarding: <TeamOutlined />,
//   onboarded: <CheckCircleOutlined />,
//   interview_round: <UserOutlined />,
//   rejected: <CloseCircleOutlined />,
//   on_hold: <ClockCircleOutlined />,
//   telephonic: <TeamOutlined />,
// };

// const fetchCompanyStats = async () => {
//   try {
//     const response = await axios.get("/api/v1/hiring/comp/stats");
//     return response.data.data;
//   } catch (error) {
//     toast.error("Failed to fetch company stats");
//     throw error;
//   }
// };

// function CompanyStats() {
  

//   const {
//     data,
//     isPending: isLoading,
//     isError,
//   } = useQuery({
//     queryKey: ["companyStats"],
//     queryFn: fetchCompanyStats,
//     refetchOnWindowFocus: false,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });
// console.log(data)
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Spin size="large" />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-red-500">Error loading company statistics</p>
//       </div>
//     );
//   }

//   const statusColumns = [
//     {
//       title: "Status",
//       dataIndex: "_id",
//       key: "status",
//       render: (status) => (
//         <Tag icon={statusIcons[status]} color={statusColors[status]}>
//           {status.toUpperCase()}
//         </Tag>
//       ),
//     },
//     {
//       title: "Count",
//       dataIndex: "count",
//       key: "count",
//       sorter: (a, b) => a.count - b.count,
//     },
//     {
//       title: "Percentage",
//       key: "percentage",
//       render: (record) => (
//         <span>
//           {((record.count / data.totalApplications) * 100).toFixed(1)}%
//         </span>
//       ),
//     },
//   ];

//   const creatorColumns = [
//     {
//       title: "Recruiter",
//       dataIndex: "_id",
//       key: "creator",
//       render: (id) => (
//         <div>
//           <div className="font-semibold">{id.creatorName}</div>
//         </div>
//       ),
//     },
//     {
//       title: "Total",
//       dataIndex: "total",
//       key: "total",
//       sorter: (a, b) => a.total - b.total,
//     },
//     {
//       title: "Hired",
//       key: "hired",
//       render: (record) => {
//         const hiredCount =
//           record.statuses.find((s) => s.status === "onboarded")?.count || 0;
//         return (
//           <div>
//             <Tag color="green">{hiredCount}</Tag>
//             <span className="ml-2 text-sm text-gray-500">
//               ({((hiredCount / record.total) * 100).toFixed(1)}%)
//             </span>
//           </div>
//         );
//       },
//     },
//     {
//       title: "Rejected",
//       key: "rejected",
//       render: (record) => {
//         const rejectedCount =
//           record.statuses.find((s) => s.status === "rejected")?.count || 0;
//         return (
//           <div>
//             <Tag color="red">{rejectedCount}</Tag>
//             <span className="ml-2 text-sm text-gray-500">
//               ({((rejectedCount / record.total) * 100).toFixed(1)}%)
//             </span>
//           </div>
//         );
//       },
//     },
//     {
//       title: "In Process",
//       key: "inProcess",
//       render: (record) => {
//         const inProcessCount = record.statuses
//           .filter(
//             (s) =>
//               s.status === "applied" ||
//               s.status === "interview_round" ||
//               s.status === "telephonic" ||
//               s.status === "on_hold"
//           )
//           .reduce((sum, s) => sum + s.count, 0);
//         return (
//           <div>
//             <Tag color="orange">{inProcessCount}</Tag>
//             <span className="ml-2 text-sm text-gray-500">
//               ({((inProcessCount / record.total) * 100).toFixed(1)}%)
//             </span>
//           </div>
//         );
//       },
//     },
//     {
//       title: "Action",
//       key: "action", // Fixed typo in key ("actioon" -> "action")
//       render: (record) => (
//         <div>
         
//           <a
//             onClick={() =>
//               (window.location.href = `/recruitment/applications?user=${record?._id?.creatorId}`)
//             }
//           >
//             <EyeOutlined />
//           </a>
//           <a
//           className="px-4"
//             onClick={() =>
//               (window.location.href = `/recruitment/onboarding?user=${record?._id?.creatorId}`)
//             }
//           >
//             <EyeOutlined />
//           </a>
//         </div>
//       ),
//     },
//   ];

//   const monthlyChartOptions = {
//     chart: {
//       height: 350,
//       type: "bar",
//       toolbar: {
//         show: false,
//       },
//     },
//     plotOptions: {
//       bar: {
//         borderRadius: 4,
//         horizontal: false,
//       },
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     xaxis: {
//       categories:
//         data?.monthlyTrends.map(
//           (item) => `${item._id.year}-${item._id.month}`
//         ) || [],
//     },
//     colors: ["#3B82F6"],
//     tooltip: {
//       y: {
//         formatter: function (val) {
//           return val + " applications";
//         },
//       },
//     },
//   };

//   const monthlyChartSeries = [
//     {
//       name: "Applications",
//       data: data?.monthlyTrends.map((item) => item.count) || [],
//     },
//   ];

//   return (
//     <div className="p-4 h-[92vh] overflow-y-auto  ">
//       <Title level={2} className="mb-6">
//         Company Hiring Dashboard
//       </Title>

//       <Row gutter={[16, 16]} className="mb-6">
//         <Col xs={24} sm={12} md={8} lg={6}>
//           <Card>
//             <Statistic
//               title="Total Applications"
//               value={data?.totalApplications}
//               prefix={<UserOutlined />}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={12} md={8} lg={6}>
//           <Card>
//             <Statistic
//               title="Today's Applications"
//               value={data?.todaysApplications}
//               prefix={<ArrowUpOutlined />}
//               valueStyle={{ color: "#3f8600" }}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={12} md={8} lg={6}>
//           <Card>
//             <Statistic
//               title="Hired Candidates"
//               value={
//                 data?.statusCounts.find((s) => s._id === "onboarded")?.count ||
//                 0
//               }
//               prefix={<CheckCircleOutlined />}
//               valueStyle={{ color: "#52c41a" }}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={12} md={8} lg={6}>
//           <Card>
//             <Statistic
//               title="Onboarding Candidates"
//               value={
//                 data?.statusCounts.find((s) => s._id === "onboarding")?.count ||
//                 0
//               }
//               prefix={<CheckCircleOutlined />}
//               valueStyle={{ color: "#52c41a" }}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={12} md={8} lg={6}>
//           <Card>
//             <Statistic
//               title="Rejected Candidates"
//               value={
//                 data?.statusCounts.find((s) => s._id === "rejected")?.count || 0
//               }
//               prefix={<CloseCircleOutlined />}
//               valueStyle={{ color: "#f5222d" }}
//             />
//           </Card>
//         </Col>
//       </Row>

//       <Row gutter={[16, 16]} className="mb-6">
//         <Col xs={24} lg={12}>
//           <Card title="Application Status Distribution" className="h-full">
//             <Table
//               columns={statusColumns}
//               dataSource={data?.statusCounts}
//               rowKey="_id"
//               pagination={false}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} lg={12}>
//           <Card title="Monthly Application Trends" className="h-full">
//             <Chart
//               options={monthlyChartOptions}
//               series={monthlyChartSeries}
//               type="bar"
//               height={300}
//             />
//           </Card>
//         </Col>
//       </Row>

//       <Card title="Recruiter Performance" className="mb-6">
//         <Table
//           columns={creatorColumns}
//           dataSource={
//             (Array.isArray(data?.creatorStats) && data?.creatorStats) || []
//           }
//           rowKey={(record) => record._id.creatorId}
//           pagination={{ pageSize: 5 }}
//         />
//       </Card>
//     </div>
//   );
// }

// export default CompanyStats;



import React, { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Spin, 
  Typography, 
  DatePicker, 
  Button, 
  Space,
  Segmented,
  Alert,
  Divider
} from "antd";
import { 
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  EyeOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CalendarOutlined,
  FilterOutlined,
  SyncOutlined
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import { toast } from "react-hot-toast";
import Chart from "react-apexcharts";
import moment from "moment";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusColors = {
  applied: "blue",
  onboarding: "purple",
  onboarded: "green",
  interview_round: "orange",
  rejected: "red",
  on_hold: "gold",
  telephonic: "cyan",
};

const statusIcons = {
  applied: <ClockCircleOutlined />,
  onboarding: <TeamOutlined />,
  onboarded: <CheckCircleOutlined />,
  interview_round: <UserOutlined />,
  rejected: <CloseCircleOutlined />,
  on_hold: <ClockCircleOutlined />,
  telephonic: <TeamOutlined />,
};

const fetchCompanyStats = async (dateRange) => {
  try {
    const params = {};
    if (dateRange && dateRange.length === 2) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    
    const response = await axios.get("/api/v1/hiring/comp/stats", { params });
    return response.data.data;
  } catch (error) {
    toast.error("Failed to fetch company stats");
    throw error;
  }
};

function CompanyStats() {
  const [dateRange, setDateRange] = useState([]);
  const [activeChart, setActiveChart] = useState('daily');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  
  const {
    data,
    isPending: isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["companyStats", dateRange],
    queryFn: () => fetchCompanyStats(dateRange),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const handleFilterApply = () => {
    if (dateRange && dateRange.length === 2) {
      setIsFilterApplied(true);
      refetch();
    } else {
      toast.error("Please select both start and end dates");
    }
  };

  const handleResetFilter = () => {
    setDateRange([]);
    setIsFilterApplied(false);
    refetch();
  };

  const statusColumns = [
    {
      title: "Status",
      dataIndex: "_id",
      key: "status",
      render: (status) => (
        <Tag icon={statusIcons[status]} color={statusColors[status]}>
          {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </Tag>
      ),
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: "Percentage",
      key: "percentage",
      render: (record) => (
        <span>
          {((record.count / data?.totalApplications) * 100).toFixed(1)}%
        </span>
      ),
    },
  ];

  const creatorColumns = [
    {
      title: "Recruiter",
      dataIndex: "_id",
      key: "creator",
      render: (id) => (
        <div className="font-semibold">{id.creatorName}</div>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "Hired",
      key: "hired",
      render: (record) => {
        const hiredCount = record.statuses?.onboarded || 0;
        return (
          <div>
            <Tag color="green">{hiredCount}</Tag>
            <span className="ml-2 text-sm text-gray-500">
              ({((hiredCount / record.total) * 100).toFixed(1)}%)
            </span>
          </div>
        );
      },
    },
    {
      title: "Rejected",
      key: "rejected",
      render: (record) => {
        const rejectedCount = record.statuses?.rejected || 0;
        return (
          <div>
            <Tag color="red">{rejectedCount}</Tag>
            <span className="ml-2 text-sm text-gray-500">
              ({((rejectedCount / record.total) * 100).toFixed(1)}%)
            </span>
          </div>
        );
      },
    },
    {
      title: "Hold",
      key: "on_hold",
      render: (record) => {
        const rejectedCount = record.statuses?.on_hold || 0;
        return (
          <div>
            <Tag color="yellow">{rejectedCount}</Tag>
            <span className="ml-2 text-sm text-gray-500">
              ({((rejectedCount / record.total) * 100).toFixed(1)}%)
            </span>
          </div>
        );
      },
    },
    {
      title: "In Process",
      key: "inProcess",
      render: (record) => {
        const inProcessCount = 
          (record.statuses?.applied || 0) +
          (record.statuses?.interview_round || 0) +
          (record.statuses?.telephonic || 0) +
          (record.statuses?.on_hold || 0);
        return (
          <div>
           { console.log(record)}
            <Tag color="orange">{inProcessCount}</Tag>
            <span className="ml-2 text-sm text-gray-500">
              ({((inProcessCount / record.total) * 100).toFixed(1)}%)
            </span>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => window.location.href = `/recruitment/applications?user=${record._id.creatorId}`}
          />
        </Space>
      ),
    },
  ];

  const renderTrendChart = () => {
    if (!data) return null;
    
    const chartData = activeChart === 'daily' ? 
      data.dailyTrends : 
      activeChart === 'monthly' ? 
      data.monthlyTrends : 
      data.hourlyTrends;

    const options = {
      chart: {
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: true }
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      xaxis: {
        categories: chartData.map(item => 
          activeChart === 'daily' ? moment(item._id.date).format('MMM D') :
          activeChart === 'monthly' ? `${item._id.month}/${item._id.year}` :
          `${item._id.hour}:00`
        ),
        labels: {
          rotate: activeChart === 'monthly' ? -45 : 0
        }
      },
      yaxis: {
        title: { text: 'Applications' }
      },
      tooltip: {
        y: { formatter: (val) => `${val} applications` }
      },
      colors: ['#3B82F6']
    };

    const series = [{
      name: 'Applications',
      data: chartData.map(item => item.count)
    }];

    return (
      <Chart
        options={options}
        series={series}
        type="area"
        height={350}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading company statistics..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert
          message="Error Loading Data"
          description="Failed to load company statistics. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-4 h-[92vh] overflow-y-auto">
      <Title level={2} className="mb-6">
        <BarChartOutlined /> Company Hiring Dashboard
      </Title>

      {/* Date Filter Section */}
      <Card 
        title={<><FilterOutlined /> Filter Data</>} 
        className="mb-6"
        extra={
          isFilterApplied && (
            <Button 
              icon={<SyncOutlined />} 
              onClick={handleResetFilter}
            >
              Reset
            </Button>
          )
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            disabledDate={current => current && current > moment().endOf('day')}
            style={{ width: '100%', maxWidth: '400px' }}
            ranges={{
              'Today': [moment(), moment()],
              'This Week': [moment().startOf('week'), moment().endOf('week')],
              'This Month': [moment().startOf('month'), moment().endOf('month')],
              'Last 7 Days': [moment().subtract(7, 'days'), moment()],
              'Last 30 Days': [moment().subtract(30, 'days'), moment()],
            }}
          />
          <Button 
            type="primary" 
            icon={<FilterOutlined />}
            onClick={handleFilterApply}
            disabled={!dateRange || dateRange.length !== 2}
          >
            Apply Filter
          </Button>
          
          {isFilterApplied && dateRange.length === 2 && (
            <Text type="secondary">
              Showing data from {dateRange[0].format('MMM D, YYYY')} to {dateRange[1].format('MMM D, YYYY')}
            </Text>
          )}
        </Space>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={data?.totalApplications}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Today's Applications"
              value={data?.todaysApplications}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
            {data?.yesterdaysApplications && (
              <div className="mt-2 text-sm">
                <Text type={data.todaysApplications >= data.yesterdaysApplications ? "success" : "danger"}>
                  {Math.abs(
                    ((data.todaysApplications - data.yesterdaysApplications) / 
                    data.yesterdaysApplications) * 100
                  ).toFixed(1)}% 
                  {data.todaysApplications >= data.yesterdaysApplications ? 
                    <ArrowUpOutlined /> : <ArrowDownOutlined />} from yesterday
                </Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="This Week"
              value={data?.thisWeekApplications}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Hired Candidates"
              value={
                data?.statusCounts.find((s) => s._id === "onboarded")?.count || 0
              }
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Trends Section */}
      <Card 
        title={<><LineChartOutlined /> Application Trends</>}
        className="mb-6"
        extra={
          <Segmented
            options={[
              { label: 'Daily', value: 'daily' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Hourly', value: 'hourly' },
            ]}
            value={activeChart}
            onChange={setActiveChart}
          />
        }
      >
        {renderTrendChart()}
      </Card>

      {/* Status Distribution */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Application Status Distribution">
            <Table
              columns={statusColumns}
              dataSource={data?.statusCounts}
              rowKey="_id"
              pagination={false}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recruiter Performance">
            <Table
              columns={creatorColumns}
              dataSource={  Array.isArray(data?.creatorStats) && data?.creatorStats   }
              rowKey={(record) => record._id.creatorId}
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>

      {/* Hourly Breakdown (only shown when not in hourly view) */}
      {activeChart !== 'hourly' && data?.hourlyTrends && (
        <Card title="Hourly Application Pattern" className="mb-6">
          <Chart
            options={{
              chart: { type: 'bar', height: 350 },
              xaxis: {
                categories: data.hourlyTrends.map(item => `${item._id.hour}:00`),
                title: { text: 'Hour of Day' }
              },
              yaxis: { title: { text: 'Applications' } },
              plotOptions: { bar: { borderRadius: 4 } }
            }}
            series={[{
              name: 'Applications',
              data: data.hourlyTrends.map(item => item.count)
            }]}
            type="bar"
            height={350}
          />
        </Card>
      )}
    </div>
  );
}

export default CompanyStats;