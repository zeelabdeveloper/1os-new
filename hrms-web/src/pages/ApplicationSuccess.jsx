import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const ApplicationSuccess = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Result
        status="success"
        title="Application Submitted Successfully!"
        subTitle="Thank you for applying. We'll review your application and get back to you soon."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Go Home
          </Button>,
        ]}
      />
    </div>
  );
};

export default ApplicationSuccess;