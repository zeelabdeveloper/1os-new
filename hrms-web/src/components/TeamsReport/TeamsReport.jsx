// import React, { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import {
//   Card,
//   Statistic,
//   Tag,
//   Space,
//   Button,
//   DatePicker,
//   Divider,
//   Spin,
//   Alert,
// } from "antd";
// import {
//   TeamOutlined,
//   CheckCircleOutlined,
//   CloseCircleOutlined,
//   ClockCircleOutlined,
//   DownloadOutlined,
//   PieChartOutlined,
//   BarChartOutlined,
//   LineChartOutlined,
// } from "@ant-design/icons";
// import { FaUserTie, FaRegClock, FaCut } from "react-icons/fa";
// import { GiProgression } from "react-icons/gi";
// import dayjs from "dayjs";
// import axiosInstance from "../../axiosConfig";

// const { RangePicker } = DatePicker;

// // Mock API functions - replace with actual API calls
// const fetchTeamMetrics = async (usert) => {
//   const data = await axiosInstance.get(
//     `/api/v1/team/myteam/analytics/${usert}`
//   );
//   console.log(data.data);
//   return data.data;
// };

// function TeamsReport({ user }) {
//   const { data, isLoading, isError } = useQuery({
//     queryKey: ["teamMetrics"],
//     queryFn: () => fetchTeamMetrics(user?._id),
//     keepPreviousData: true,
//   });

//   if (isError) {
//     return null;
//   }

//   return (
//     <div className="p-4">
//     {data?.inactiveMembers<=0 || data.activeMembers<=0 || data.totalMembers<=0    &&  <div className="mb-6">
//         <h1 className="text-2xl font-bold flex items-center">
//           <TeamOutlined className="mr-2" /> Team Metrics Dashboard
//         </h1>
//         <p className="text-gray-600">
//           Aggregated statistics and analytics for your team
//         </p>
//       </div>}

//       {isLoading ? (
//         <div className="flex justify-center items-center h-64">
//           <Spin size="large" tip="Loading team metrics..." />
//         </div>
//       ) : (
//         <>
//           {data?.inactiveMembers<=0 || data.activeMembers<=0 || data.totalMembers<=0    && (
//             <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
//               <Card>
//                 <Statistic
//                   title="Total Team Members"
//                   value={data?.totalMembers}
//                   prefix={<TeamOutlined />}
//                 />
//               </Card>
//               <Card>
//                 <Statistic
//                   title="Active Members"
//                   value={data?.activeMembers}
//                   prefix={<CheckCircleOutlined />}
//                   valueStyle={{ color: "#52c41a" }}
//                 />
//               </Card>
//               <Card>
//                 <Statistic
//                   title="inactive Members"
//                   value={data?.inactiveMembers}
//                   prefix={<FaCut />}
//                   valueStyle={{ color: "#52c41a" }}
//                 />
//               </Card>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// export default TeamsReport;


import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Statistic,
 
} from "antd";
import {
  TeamOutlined,
  CheckCircleOutlined,
 
} from "@ant-design/icons";
import { FaUserTie, FaRegClock, FaCut } from "react-icons/fa";
import { GiProgression } from "react-icons/gi";
import dayjs from "dayjs";
import axiosInstance from "../../axiosConfig";

 

const fetchTeamMetrics = async (usert) => {
  const data = await axiosInstance.get(
    `/api/v1/team/myteam/analytics/${usert}`
  );
  console.log(data.data);
  return data.data;
};

function TeamsReport({ user }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["teamMetrics", user?._id],
    queryFn: () => fetchTeamMetrics(user?._id),
    keepPreviousData: true,
    enabled: !!user?._id, // Only fetch if user._id exists
  });

  // If error or no data, return null
  if (isError || !data) {
    return null;
  }

  // Check if all metrics are zero or undefined
  const shouldHideMetrics = 
    data.inactiveMembers <= 0 && 
    data.activeMembers <= 0 && 
    data.totalMembers <= 0;

  // If all metrics are zero or loading, return null
  if (shouldHideMetrics || isLoading) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <TeamOutlined className="mr-2" /> Team Metrics Dashboard
        </h1>
        <p className="text-gray-600">
          Aggregated statistics and analytics for your team
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Statistic
            title="Total Team Members"
            value={data?.totalMembers}
            prefix={<TeamOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="Active Members"
            value={data?.activeMembers}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
        <Card>
          <Statistic
            title="inactive Members"
            value={data?.inactiveMembers}
            prefix={<FaCut />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </div>
    </div>
  );
}

export default TeamsReport;