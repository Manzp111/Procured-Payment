import { useEffect, useState } from "react";
import axios from "axios";
import { BiCheckCircle } from "react-icons/bi";


interface User {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface Request {
  id: number;
  title: string;
  status: string;
  amount: string;
  current_level: number;
  created_by: User;
  proforma_url?: string;
  purchase_order_url?: string;
}

export default function ReviewedRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchReviewedRequests = async () => {
      setLoading(true);
      try {
        const url = `http://127.0.0.1:8000/api/requests/?approved_by_me=1`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data: Request[] = res.data.data.results.map((r: any) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          amount: r.amount,
          current_level: r.current_level,
          created_by: r.created_by,
          proforma_url: r.proforma_url,
          purchase_order_url: r.purchase_order_url,
        }));

        setRequests(data);
      } catch (err) {
        console.error("Error fetching reviewed requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewedRequests();
  }, [accessToken]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center">
        <BiCheckCircle className="me-2" /> Reviewed Requests
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No reviewed requests found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Current Level</th>
                <th>Created By</th>
                <th>Proforma</th>
                <th>PO</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.title}</td>
                  <td>
                    <span
                      className={
                        r.status === "APPROVED"
                          ? "badge bg-success"
                          : r.status === "REJECTED"
                          ? "badge bg-danger"
                          : "badge bg-secondary"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>${r.amount}</td>
                  <td>{r.current_level}</td>
                  <td>
                    {r.created_by.first_name} {r.created_by.last_name} (
                    {r.created_by.role})
                  </td>
                  <td>
                    {r.proforma_url ? (
                      <a
                        href={r.proforma_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {r.purchase_order_url ? (
                      <a
                        href={r.purchase_order_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
