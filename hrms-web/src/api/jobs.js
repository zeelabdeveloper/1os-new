import axios from "../axiosConfig";
export const createJob = async (data) => {
  const { dat } = await axios.post("/api/v1/jobs", data);
  return dat;
};

export const fetchJobs = async () => {
  const response = await axios.get("/api/v1/jobs");
  console.log(response.data);
  return response?.data?.data || [];
};
export const fetchJobList = async () => {
  const response = await axios.get("/api/v1/jobs");

  return response?.data;
};

export const updateJob = async (jobData) => {
  const response = await axios.put(`/api/v1/jobs/${jobData._id}`, jobData);
  return response.data;
};

export const deleteJob = async (jobId) => {
  const response = await axios.delete(`/api/v1/jobs/${jobId}`);
  return response.data;
};

export const fetchJobStats = async () => {
  const response = await axios.get("/api/v1/jobs/stats/all");
  console.log(response.data.data);
  return response.data.data;
};

// export const fetchApplications = async (jobId, dateFilter) => {
//   console.log(jobId)
//   console.log(dateFilter)
//   try {
//     const response = await axios.get(
//       `/api/v1/jobs/applications/status?dateFilter=${dateFilter}&jobId=${jobId}`
//     );

//     // GET /api/v1/jobs/applications/status?dateFilter=,&%20jobId=686f6819dded24d9c828f740 
//     console.log(response.data);
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     return [];
//   }
// };


// export const fetchApplications = async (jobId, dateFilter) => {
//   try {
//     const query = {};
// console.log(dateFilter)
//     // Only add if not null/undefined/empty
//     if (jobId) query.jobId = jobId;

//     // Ensure dateFilter is an array and valid (e.g., not [null, null])
//     if (
//       Array.isArray(dateFilter) &&
//       (dateFilter[0] || dateFilter[1])
//     ) {
//       query.dateFilter = JSON.stringify(dateFilter); // Optional: stringify if array
//     }

//     const queryString = new URLSearchParams(query).toString();

//     const response = await axios.get(
//       `/api/v1/jobs/applications/status?${queryString}`
//     );

//     console.log(response.data);
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     return [];
//   }
// };



 


export const fetchApplications = async (jobId, dateFilter, createdBy, { search = "", page = 1, limit = 10 } = {}) => {
  try {
    const query = {};

    if (jobId) query.jobId = jobId;
    if (createdBy) query.createdBy = createdBy;
    if (search) query.search = search;
    if (page) query.page = page;
    if (limit) query.limit = limit;

    if (Array.isArray(dateFilter) && (dateFilter[0] || dateFilter[1])) {
      const [start, end] = dateFilter;
      if (start) query.startDate = start.format("YYYY-MM-DD");
      if (end) query.endDate = end.format("YYYY-MM-DD");
    }

    const response = await axios.get(`/api/v1/jobs/applications/status`, { params: query });
    return response.data;
  } catch (error) {
    console.error(error);
    return { data: [], pagination: { total: 0 } };
  }
};




















export const fetchHiredApplications = async (id) => {
 
    const response = await axios.get(
      `/api/v1/jobs/application/hired/${id}`
    );
  
    return response.data;

};

export const updateApplicationStatus = async ({ id, status , notes }) => {
  const response = await axios.patch(`/api/v1/jobs/application/${id}/status`, {
    status,notes
  });
  return response.data;
};
export const updateJobApplication = async ( id, data ) => {
  const response = await axios.patch(`/api/v1/jobs/application/${id}/status/allUpdate`, {
    data,
  });
  return response.data;
};
export const initiateOnboarding = async (data) => {
  const response = await axios.post("/api/v1/recruitment/onboarding", data);
  return response.data;
};

export const fetchApplicationById = async (id) => {
 
  const response = await axios.get(`/api/v1/jobs/application/${id}`);
   
  return response.data;
};
export const deleteApplicationStatus = async (id) => {
  const response = await axios.delete(`/api/v1/jobs/application/${id}/status`);
  return response.data;
};

export const submitJobApplication = async (formData) => {
  console.log(...formData);
  const response = await axios.post("/api/v1/jobs/applications", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchOnboardings = async () => {
  const response = await axios.get("/api/v1/onboarding");

  return response.data;
};

export const deleteOnboarding = (id) => {
  return axios.delete(`/api/v1/onboarding/${id}`);
};

export const convertToEmployee = (id) => {
  return axios.post(`/api/v1/onboarding/${id}/convert`);
};











