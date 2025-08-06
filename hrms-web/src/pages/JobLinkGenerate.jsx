// // import React, { useEffect, useState } from 'react';
// // import { useParams, useSearchParams } from 'react-router-dom';
// // import { Skeleton, Card, Button, Space, Typography, Divider } from 'antd';
// // import { ShareAltOutlined, DownloadOutlined } from '@ant-design/icons';
// // import {QRCodeCanvas} from 'qrcode.react';
// // import Barcode from 'react-barcode';
// // import { useQuery } from '@tanstack/react-query';
// // import axios from '../axiosConfig';
// // import { toast } from 'react-hot-toast';

// // const { Title, Text } = Typography;

// // function JobLinkGenerate() {
// //   const [searchParams] = useSearchParams();
// //   const jobId = searchParams.get("jobId");

// //   console.log("Job ID:", jobId);
// //   const [downloadUrl, setDownloadUrl] = useState('');

// //   const { data: jobData, isLoading, isError, error } = useQuery({
// //     queryKey: ['jobLink', jobId],
// //     queryFn: async () => {
// //       const response = await axios.get(`/api/v1/tracker/job-link/${jobId}`);
// //       return response.data;
// //     },
// //     onError: (err) => {
// //       toast.error('Failed to load job details');
// //       console.error('Error fetching job details:', err);
// //     }
// //   });

// //   useEffect(() => {
// //     if (jobData?.applicationLink) {
// //       const canvas = document.getElementById('qr-canvas');
// //       if (canvas) {
// //         setDownloadUrl(canvas.toDataURL('image/png'));
// //       }
// //     }
// //   }, [jobData]);

// //   const handleDownload = () => {
// //     if (downloadUrl) {
// //       const link = document.createElement('a');
// //       link.href = downloadUrl;
// //       link.download = `job-${jobId}-qrcode.png`;
// //       document.body.appendChild(link);
// //       link.click();
// //       document.body.removeChild(link);
// //     }
// //   };

// //   const handleShare = () => {
// //     if (navigator.share && jobData?.applicationLink) {
// //       navigator.share({
// //         title: `Apply for ${jobData?.job?.title}`,
// //         text: `Check out this job opportunity: ${jobData?.job?.title}`,
// //         url: jobData?.applicationLink,
// //       })
// //       .catch(err => console.error('Error sharing:', err));
// //     } else {
// //       navigator.clipboard.writeText(jobData?.applicationLink)
// //         .then(() => toast.success('Link copied to clipboard!'))
// //         .catch(() => toast.error('Failed to copy link'));
// //     }
// //   };

// //   if (isLoading) {
// //     return (
// //       <div className="p-4 max-w-4xl mx-auto">
// //         <Skeleton active paragraph={{ rows: 6 }} />
// //       </div>
// //     );
// //   }

// //   if (isError) {
// //     return (
// //       <div className="p-4 max-w-4xl mx-auto">
// //         <Card>
// //           <Title level={4}>Error loading job details</Title>
// //           <Text type="danger">{error.message}</Text>
// //         </Card>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="p-4 max-w-4xl mx-auto">
// //       <Card
// //         title={<Title level={3}>Job Application Link Generator</Title>}
// //         extra={
// //           <Space>
// //             <Button 
// //               icon={<DownloadOutlined />} 
// //               onClick={handleDownload}
// //               disabled={!downloadUrl}
// //             >
// //               Download QR
// //             </Button>
// //             <Button 
// //               type="primary" 
// //               icon={<ShareAltOutlined />} 
// //               onClick={handleShare}
// //               disabled={!jobData?.applicationLink}
// //             >
// //               Share Link
// //             </Button>
// //           </Space>
// //         }
// //       >
// //         <div className="mb-6">
// //           <Title level={4}>{jobData?.job?.title}</Title>
// //           <Text>{jobData?.job?.branch?.name} • {jobData?.job?.department?.name}</Text>
// //         </div>

// //         <Divider orientation="left">Application Link</Divider>
// //         <div className="mb-6 p-4 bg-gray-50 rounded">
// //           <Text copyable>{jobData?.applicationLink}</Text>
// //         </div>

// //         {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
// //           <div className="flex flex-col items-center">
// //             <Divider orientation="left">QR Code</Divider>
// //             <div className="p-4 border rounded">
// //               <QRCodeCanvas 
// //                 id="qr-canvas"
// //                 value={jobData?.applicationLink || ''} 
// //                 size={200} 
// //                 level="H"
// //                 includeMargin
// //               />
// //             </div>
// //             <Text className="mt-2" type="secondary">Scan to apply</Text>
// //           </div>

// //           <div className="flex flex-col items-center">
// //             <Divider orientation="left">Barcode</Divider>
// //             <div className="p-4 border rounded">
// //               <Barcode
// //                 value={jobData?.barcodeData || 'JOB-' + jobId}
// //                 width={2}
// //                 height={100}
// //                 displayValue={false}
// //               />
// //             </div>
// //             <Text className="mt-2" type="secondary">Job ID: {jobId}</Text>
// //           </div>
// //         </div> */}





// // <div className="grid grid-cols-1 gap-6">
// //   {/* QR Code Section */}
// //   <div className="flex flex-col items-center text-center">
// //     <Divider orientation="left">QR Code</Divider>
// //     <div className="p-4 border rounded shadow-sm w-full  ">
// //       <QRCodeCanvas 
// //         id="qr-canvas"
// //         style={{margin:'auto'}}
// //         value={jobData?.applicationLink || ''} 
// //         size={200} 
// //         level="H"
// //         includeMargin
// //       />
// //     </div>
// //     <Text className="mt-2 text-sm text-gray-500">Scan to apply</Text>
// //   </div>

// //   {/* Barcode Section */}
// //   <div className="flex flex-col items-center text-center">
// //     <Divider orientation="left">Barcode</Divider>
// //     <div className="p-4 border rounded shadow-sm flex items-center justify-center w-full  ">
// //       <Barcode
// //         style={{margin:'auto'}}
// //         value={jobData?.barcodeData || 'JOB-' + jobId}
// //         width={2}
// //         height={100}
// //         displayValue={false}
// //       />
// //     </div>
// //     <Text className="mt-2 text-sm text-gray-500">Job ID: {jobId}</Text>
// //   </div>
// // </div>







        

// //         <Divider orientation="left">Job Details</Divider>
// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
// //           <div>
// //             <Text strong>Location:</Text> {jobData?.job?.location}
// //           </div>
// //           <div>
// //             <Text strong>Experience:</Text> {jobData?.job?.experience}
// //           </div>
// //           <div>
// //             <Text strong>Salary Range:</Text> 
// //             {jobData?.job?.salary?.min && `${jobData.job.salary.min} - ${jobData.job.salary.max} ${jobData.job.salary.currency}`}
// //           </div>
// //           <div>
// //             <Text strong>Posted On:</Text> 
// //             {new Date(jobData?.job?.postedAt).toLocaleDateString()}
// //           </div>
// //         </div>
// //       </Card>
// //     </div>
// //   );
// // }

// // export default JobLinkGenerate;



// import React, { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { Skeleton, Card, Button, Space, Typography, Divider } from 'antd';
// import { ShareAltOutlined, DownloadOutlined, LinkOutlined } from '@ant-design/icons';
// import { QRCodeCanvas } from 'qrcode.react';
// import Barcode from 'react-barcode';
// import { useQuery } from '@tanstack/react-query';
// import axios from '../axiosConfig';
// import { toast } from 'react-hot-toast';

// const { Title, Text } = Typography;

// function JobLinkGenerate() {
//   const [searchParams] = useSearchParams();
//   const jobId = searchParams.get("jobId");
//   const [downloadUrl, setDownloadUrl] = useState('');

//   const { data: jobData, isLoading, isError, error } = useQuery({
//     queryKey: ['jobLink', jobId],
//     queryFn: async () => {
//       const response = await axios.get(`/api/v1/tracker/job-link/${jobId}`);
//       return response.data;
//     },
//     onError: (err) => {
//       toast.error('Failed to load job details');
//       console.error('Error fetching job details:', err);
//     }
//   });

//   useEffect(() => {
//     if (jobData?.applicationLink) {
//       const canvas = document.getElementById('qr-canvas');
//       if (canvas) {
//         setDownloadUrl(canvas.toDataURL('image/png'));
//       }
//     }
//   }, [jobData]);

//   const handleDownload = () => {
//     if (downloadUrl) {
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = `job-${jobId}-qrcode.png`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   const handleShare = () => {
//     if (navigator.share && jobData?.applicationLink) {
//       navigator.share({
//         title: `Apply for ${jobData?.job?.title}`,
//         text: `Check out this job opportunity: ${jobData?.job?.title}`,
//         url: jobData?.applicationLink,
//       })
//       .catch(err => console.error('Error sharing:', err));
//     } else {
//       navigator.clipboard.writeText(jobData?.applicationLink)
//         .then(() => toast.success('Link copied to clipboard!'))
//         .catch(() => toast.error('Failed to copy link'));
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="p-4 max-w-4xl mx-auto">
//         <Skeleton active paragraph={{ rows: 6 }} />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="p-4 max-w-4xl mx-auto">
//         <Card className="glass-card">
//           <Title level={4}>Error loading job details</Title>
//           <Text type="danger">{error.message}</Text>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-4 max-w-6xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50">
//       {/* Main Glass Card */}
//       <div className="glass-card p-6 rounded-2xl shadow-xl backdrop-blur-lg border border-white border-opacity-30">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
//           <div>
//             <Title level={2} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
//               {jobData?.job?.title || 'Job Application'}
//             </Title>
//             {jobData?.job?.branch?.name && jobData?.job?.department?.name && (
//               <Text className="text-gray-600">
//                 {jobData.job.branch.name} • {jobData.job.department.name}
//               </Text>
//             )}
//           </div>
          
//           <Space className="mt-4 md:mt-0">
//             <Button 
//               type="default" 
//               icon={<DownloadOutlined />} 
//               onClick={handleDownload}
//               disabled={!downloadUrl}
//               className="glass-button"
//             >
//               Download QR
//             </Button>
//             <Button 
//               type="primary" 
//               icon={<ShareAltOutlined />} 
//               onClick={handleShare}
//               disabled={!jobData?.applicationLink}
//               className="shadow-lg"
//             >
//               Share Link
//             </Button>
//           </Space>
//         </div>

//         {/* Application Link Section */}
//         <div className="mb-8">
//           <Divider orientation="left" className="text-gray-600">Application Link</Divider>
//           <div className="glass-input p-3 rounded-lg flex items-center">
//             <LinkOutlined className="text-blue-500 mr-2" />
//             <Text className="text-gray-800 truncate flex-1">{jobData?.applicationLink}</Text>
//             <Button 
//               type="text" 
//               onClick={() => {
//                 navigator.clipboard.writeText(jobData?.applicationLink)
//                   .then(() => toast.success('Copied to clipboard!'));
//               }}
//               className="text-blue-500"
//             >
//               Copy
//             </Button>
//           </div>
//         </div>

//         {/* QR and Barcode Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//           {/* QR Code Card */}
//           <div className="glass-card-inner p-6 rounded-xl">
//             <Title level={4} className="text-center text-gray-700 mb-4">QR Code</Title>
//             <div className="flex justify-center p-4 bg-white rounded-lg shadow-inner">
//               <QRCodeCanvas 
//                 id="qr-canvas"
//                 value={jobData?.applicationLink || ''} 
//                 size={180}
                 
//                 level="H"
//                 includeMargin
//                 fgColor="#4f46e5"
//                 bgColor="transparent"
//               />
//             </div>
//             <Text className="block text-center mt-3 text-gray-500 text-sm">
//               Scan to apply directly
//             </Text>
//           </div>

//           {/* Barcode Card */}
//           <div className="glass-card-inner p-6 rounded-xl">
//             <Title level={4} className="text-center text-gray-700 mb-4">Job ID Barcode</Title>
//             <div className="flex justify-center p-4 bg-white rounded-lg shadow-inner">
//               <Barcode
//                 value={jobData?.applicationLink || 'JOB-' + jobId}
//                 width={1.5}
//                 height={60}
//                 displayValue={true}
//                 lineColor="#4f46e5"
//                 background="transparent"
//               />
//             </div>
//             <Text className="block text-center mt-3 text-gray-500 text-sm">
//               Reference: {jobId}
//             </Text>
//           </div>
//         </div>

//         {/* Job Details Section - Only show if data exists */}
//         {(jobData?.job?.location || jobData?.job?.experience || jobData?.job?.salary) && (
//           <>
//             <Divider orientation="left" className="text-gray-600">Position Details</Divider>
           
           
               
           
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">


   









//               {jobData?.job?.location && (
//                 <div className="glass-detail-card p-4 rounded-lg">
//                   <Text strong className="block text-gray-500 mb-1">Location</Text>
//                   <Text className="text-gray-800">{jobData.job.location}</Text>
//                 </div>
//               )}
              
//               {jobData?.job?.experience && (
//                 <div className="glass-detail-card p-4 rounded-lg">
//                   <Text strong className="block text-gray-500 mb-1">Experience</Text>
//                   <Text className="text-gray-800">{jobData.job.experience} years</Text>
//                 </div>
//               )}
              
//               {jobData?.job?.salary?.min && (
//                 <div className="glass-detail-card p-4 rounded-lg">
//                   <Text strong className="block text-gray-500 mb-1">Salary Range</Text>
//                   <Text className="text-gray-800">
//                     {jobData.job.salary.min} - {jobData.job.salary.max} {jobData.job.salary.currency}
//                   </Text>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Add these styles to your global CSS */}
//       <style jsx global>{`
//         .glass-card {
//           background: rgba(255, 255, 255, 0.7);
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//           box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
//         }
//         .glass-card-inner {
//           background: rgba(255, 255, 255, 0.4);
//           backdrop-filter: blur(5px);
//           border: 1px solid rgba(255, 255, 255, 0.3);
//         }
//         .glass-button {
//           background: rgba(255, 255, 255, 0.5);
//           border: 1px solid rgba(255, 255, 255, 0.3);
//         }
//         .glass-input {
//           background: rgba(255, 255, 255, 0.6);
//           border: 1px solid rgba(255, 255, 255, 0.4);
//         }
//         .glass-detail-card {
//           background: rgba(255, 255, 255, 0.4);
//           border: 1px solid rgba(255, 255, 255, 0.2);
//         }
//       `}</style>
//     </div>
//   );
// }

// export default JobLinkGenerate;



import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Skeleton, Card, Button, Space, Typography, Divider } from 'antd';
import { DownloadOutlined, PrinterOutlined, LinkOutlined } from '@ant-design/icons';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { useQuery } from '@tanstack/react-query';
import axios from '../axiosConfig';
import { toast } from 'react-hot-toast';

const { Title, Text } = Typography;

function JobLinkGenerate() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [downloadUrl, setDownloadUrl] = useState('');
  const printRef = useRef();

  const { data: jobData, isLoading, isError, error } = useQuery({
    queryKey: ['jobLink', jobId],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/tracker/job-link/${jobId}`);
      return response.data;
    },
    onError: (err) => {
      toast.error('Failed to load job details');
      console.error('Error fetching job details:', err);
    }
  });

 

  

const handlePrint = () => {
  setTimeout(() => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = `
      <div style="max-width:800px; margin:0 auto; padding:20px; font-family:Arial, sans-serif;">
        <h1 style="text-align:center; color:#333; margin-bottom:30px;">${jobData?.job?.title || 'Job Application'}</h1>
        ${printContents}
      </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  }, 500); // 500ms delay
};

  if (isLoading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Card className="glass-card">
          <Title level={4}>Error loading job details</Title>
          <Text type="danger">{error.message}</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto" ref={printRef}>
      {/* Main Card */}
      <Card
        title={
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <Title level={3} className="mb-0">{jobData?.job?.title || 'Job Application'}</Title>
              {jobData?.job?.branch?.name && jobData?.job?.department?.name && (
                <Text className="text-gray-600">
                  {jobData.job.branch.name} • {jobData.job.department.name}
                </Text>
              )}
            </div>
            <Space className="mt-2 md:mt-0">
             
              <Button 
                type="primary" 
                icon={<PrinterOutlined />} 
                onClick={handlePrint}
              >
                Print
              </Button>
            </Space>
          </div>
        }
        className="printable-card"
      >
        {/* Application Link Section */}
        <div className="mb-6">
          <Divider orientation="left">Application Link</Divider>
          <div className="p-3 bg-gray-50 rounded-md flex items-center">
            <LinkOutlined className="text-blue-500 mr-2" />
            <Text className="text-gray-800 truncate flex-1">{jobData?.applicationLink}</Text>
            <Button 
              type="text" 
              onClick={() => {
                navigator.clipboard.writeText(jobData?.applicationLink)
                  .then(() => toast.success('Copied to clipboard!'));
              }}
              className="text-blue-500"
            >
              Copy
            </Button>
          </div>
        </div>

        {/* QR and Barcode Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* QR Code */}
          <div className="p-4 border rounded-md">
            <Title level={4} className="text-center mb-3">QR Code</Title>
            <div className="flex justify-center p-2 bg-white rounded">
              <QRCodeSVG 
               id="qr-svg"
                value={jobData?.applicationLink || ''} 
                size={160}
                level="H"
                includeMargin
                fgColor="#1890ff"
              />
            </div>
            <Text className="block text-center mt-2 text-gray-500 text-sm">
              Scan to apply directly
            </Text>
          </div>

          {/* Barcode */}
          <div className="p-4 border rounded-md">
            <Title level={4} className="text-center mb-3">Job ID</Title>
            <div className="flex justify-center p-2 bg-white rounded">
              <Barcode
                value={jobId || ''}
                width={1.8}
                height={50}
                displayValue={true}
                fontOptions="600"
                textMargin={4}
                margin={10}
              />
            </div>
            <Text className="block text-center mt-2 text-gray-500 text-sm">
              Job Reference: {jobId}
            </Text>
          </div>
        </div>

        {/* Job Details Section */}
        {(jobData?.job?.location || jobData?.job?.experience || jobData?.job?.salary) && (
          <>
            <Divider orientation="left">Position Details</Divider>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {jobData?.job?.location && (
                <div className="p-3 border rounded-md">
                  <Text strong className="block text-gray-500 mb-1">Location</Text>
                  <Text className="text-gray-800">{jobData.job.location}</Text>
                </div>
              )}
              
              {jobData?.job?.experience && (
                <div className="p-3 border rounded-md">
                  <Text strong className="block text-gray-500 mb-1">Experience</Text>
                  <Text className="text-gray-800">{jobData.job.experience}</Text>
                </div>
              )}
              
              {jobData?.job?.salary?.min && (
                <div className="p-3 border rounded-md">
                  <Text strong className="block text-gray-500 mb-1">Salary Range</Text>
                  <Text className="text-gray-800">
                    {jobData.job.salary.min} - {jobData.job.salary.max} {jobData.job.salary.currency}
                  </Text>
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-card,
          .printable-card * {
            visibility: visible;
          }
          .printable-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
          .ant-btn {
            display: none !important;
          }
          .ant-divider {
            margin: 12px 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default JobLinkGenerate;
