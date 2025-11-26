import { useEffect, useState } from "react";
import axios from "axios";
import { BiCheckCircle, BiXCircle, BiTime, BiTask } from "react-icons/bi";
import 'bootstrap/dist/css/bootstrap.min.css';

//interface User
interface User {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}


// interface of request
interface Request {
  id: number;
  title: string;
  status: string;
  current_level: number;
  created_by: User;
  updated_at: string;
  three_way_match_status: string;
}

export default function DashboardPageSummary() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending_level_1: 0,
    pending_level_2: 0,
    approved: 0,
    rejected: 0,
    three_way_pending: 0,
    three_way_completed: 0,
  });
  const [loading, setLoading] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const url = `http://127.0.0.1:8000/api/requests/`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data: Request[] = res.data.data.results;

        setRequests(data);

        // Calculate summary counts
        setSummary({
          total: data.length,
          pending_level_1: data.filter(r => r.status === "PENDING" && r.current_level === 1).length,
          pending_level_2: data.filter(r => r.status === "PENDING" && r.current_level === 2).length,
          approved: data.filter(r => r.status === "APPROVED").length,
          rejected: data.filter(r => r.status === "REJECTED").length,
          three_way_pending: data.filter(r => r.three_way_match_status === "PENDING").length,
          three_way_completed: data.filter(r => r.three_way_match_status === "COMPLETED").length,
        });

      } catch (err) {
        console.error("Error fetching requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [accessToken]);

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4 text-primary fw-bold">Dashboard Summary</h2>

      {loading ? (
        <div className="text-center fs-5">Loading...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-2 col-sm-6">
              <div className="card shadow-sm text-center h-100 border-0 rounded-3">
                <div className="card-body">
                  <h6 className="text-muted">Total Requests</h6>
                  <p className="h3 text-primary">{summary.total}</p>
                </div>
              </div>
            </div>

            <div className="col-md-2 col-sm-6">
              <div className="card shadow-sm text-center h-100 bg-warning text-dark border-0 rounded-3">
                <div className="card-body">
                  <h6>Pending Level 1</h6>
                  <p className="h3">{summary.pending_level_1}</p>
                </div>
              </div>
            </div>

            <div className="col-md-2 col-sm-6">
              <div className="card shadow-sm text-center h-100 bg-warning text-dark border-0 rounded-3">
                <div className="card-body">
                  <h6>Pending Level 2</h6>
                  <p className="h3">{summary.pending_level_2}</p>
                </div>
              </div>
            </div>

            <div className="col-md-2 col-sm-6">
              <div className="card shadow-sm text-center h-100 bg-success text-white border-0 rounded-3">
                <div className="card-body">
                  <h6>Approved</h6>
                  <p className="h3">{summary.approved}</p>
                </div>
              </div>
            </div>

            <div className="col-md-2 col-sm-6">
              <div className="card shadow-sm text-center h-100 bg-danger text-white border-0 rounded-3">
                <div className="card-body">
                  <h6>Rejected</h6>
                  <p className="h3">{summary.rejected}</p>
                </div>
              </div>
            </div>

            {/* Three-way matching summary */}
            <div className="col-md-2 col-sm-6">
              <div className="card shadow-sm text-center h-100 bg-info text-dark border-0 rounded-3">
                <div className="card-body">
                  <h6><BiTask className="me-1"/> 3-Way Matching</h6>
                  <p className="h5 mb-1">Pending: {summary.three_way_pending}</p>
                  <p className="h5">Completed: {summary.three_way_completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Requests Table */}
          <h4 className="mt-4 mb-3 text-secondary">Recent Requests</h4>
          <div className="table-responsive shadow-sm rounded">
            <table className="table table-striped table-hover table-bordered align-middle">
              <thead className="table-primary text-dark">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Level</th>
                  <th>Created By</th>
                  <th>Updated At</th>
                  <th>3-Way Match</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 5).map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.title}</td>
                    <td>
                      {r.status === "APPROVED" && <BiCheckCircle className="text-success me-1" />}
                      {r.status === "REJECTED" && <BiXCircle className="text-danger me-1" />}
                      {r.status === "PENDING" && <BiTime className="text-warning me-1" />}
                      {r.status}
                    </td>
                    <td>{r.current_level}</td>
                    <td>{r.created_by.first_name} {r.created_by.last_name} ({r.created_by.role})</td>
                    <td>{new Date(r.updated_at).toLocaleString()}</td>
                    <td>
                      {r.three_way_match_status === "COMPLETED" 
                        ? <span className="badge bg-success">{r.three_way_match_status}</span> 
                        : <span className="badge bg-warning text-dark">{r.three_way_match_status}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
