import { useEffect, useState } from "react";
import { api } from "./api";

const adminSections = ["Dashboard", "Memberships", "Catalog", "Users", "Transactions", "Reports"];
const userSections = ["Dashboard", "Transactions", "Reports"];

const initialMembership = {
  membership_code: "",
  first_name: "",
  last_name: "",
  contact_number: "",
  contact_address: "",
  aadhar_number: "",
  start_date: "",
  end_date: ""
};

const initialCatalog = {
  item_type: "Book",
  title: "",
  author_or_creator: "",
  category: "",
  procurement_date: "",
  quantity: 1,
  cost: 0
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [loginForm, setLoginForm] = useState({ username: "adm", password: "adm" });
  const [dashboard, setDashboard] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState({ title: "", author_or_creator: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [reportRows, setReportRows] = useState([]);
  const [message, setMessage] = useState("");
  const [membershipForm, setMembershipForm] = useState(initialMembership);
  const [catalogForm, setCatalogForm] = useState(initialCatalog);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    full_name: "",
    is_admin: false,
    is_active: true
  });
  const [issueForm, setIssueForm] = useState({
    membership_id: 1,
    catalog_item_id: 1,
    issue_date: "",
    due_date: "",
    remarks: ""
  });
  const [returnForm, setReturnForm] = useState({
    issue_id: 1,
    actual_return_date: "",
    remarks: ""
  });
  const [fineForm, setFineForm] = useState({ issue_id: 1, amount: 0 });

  useEffect(() => {
    if (!user) return;
    refreshAll();
  }, [user]);

  async function refreshAll() {
    setDashboard(await api("/dashboard"));
    setMemberships(await api("/memberships"));
    setCatalog(await api("/catalog"));
    if (user?.role === "admin") {
      setUsers(await api("/users"));
    }
    setReportRows(await api("/reports/books"));
  }

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const loggedIn = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm)
      });
      setUser(loggedIn);
      setMessage(`Welcome ${loggedIn.full_name}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createMembership(event) {
    event.preventDefault();
    try {
      await api("/memberships", { method: "POST", body: JSON.stringify(membershipForm) });
      setMembershipForm(initialMembership);
      setMessage("Membership created successfully");
      refreshAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createCatalog(event) {
    event.preventDefault();
    try {
      await api("/catalog", { method: "POST", body: JSON.stringify(catalogForm) });
      setCatalogForm(initialCatalog);
      setMessage("Catalog item created successfully");
      refreshAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createUser(event) {
    event.preventDefault();
    try {
      await api("/users", { method: "POST", body: JSON.stringify(userForm) });
      setUserForm({
        username: "",
        password: "",
        full_name: "",
        is_admin: false,
        is_active: true
      });
      setMessage("User created successfully");
      refreshAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function searchCatalog(event) {
    event.preventDefault();
    try {
      const params = new URLSearchParams();
      if (search.title) params.set("title", search.title);
      if (search.author_or_creator) params.set("author_or_creator", search.author_or_creator);
      setSearchResults(await api(`/catalog/search?${params.toString()}`));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function issueItem(event) {
    event.preventDefault();
    try {
      await api("/transactions/issue", { method: "POST", body: JSON.stringify(issueForm) });
      setMessage("Transaction completed successfully");
      refreshAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function returnItem(event) {
    event.preventDefault();
    try {
      const response = await api("/transactions/return", {
        method: "POST",
        body: JSON.stringify(returnForm)
      });
      setMessage(response.message);
      refreshAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function payFine(event) {
    event.preventDefault();
    try {
      const response = await api("/transactions/pay-fine", {
        method: "POST",
        body: JSON.stringify(fineForm)
      });
      setMessage(`Fine payment recorded. Remaining: ${response.remaining_pending_amount}`);
      refreshAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadReport(path) {
    setReportRows(await api(path));
  }

  function logout() {
    setUser(null);
    setActiveSection("Dashboard");
    setMessage("You have successfully logged out.");
  }

  if (!user) {
    return (
      <div className="shell shell-login">
        <div className="login-card">
          <p className="eyebrow">Library Management System</p>
          <h1>Role Based Access</h1>
          <p className="subtle">Use `adm/adm` for admin or `user/user` for user.</p>
          <form onSubmit={handleLogin} className="grid">
            <label>
              User ID
              <input
                value={loginForm.username}
                onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                required
              />
            </label>
            <button type="submit">Login</button>
          </form>
          {message && <p className="status">{message}</p>}
        </div>
      </div>
    );
  }

  const sections = user.role === "admin" ? adminSections : userSections;

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="eyebrow">{user.role === "admin" ? "Admin Home Page" : "User Home Page"}</p>
        <h2>{user.full_name}</h2>
        <nav>
          {sections.map((section) => (
            <button
              key={section}
              className={activeSection === section ? "nav-btn active" : "nav-btn"}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </nav>
        <button className="logout-btn" onClick={logout}>
          Log Out
        </button>
      </aside>

      <main className="content">
        {message && <div className="alert">{message}</div>}

        {activeSection === "Dashboard" && (
          <section className="panel stack">
            <h1>Dashboard</h1>
            <div className="cards">
              <article className="card">
                <span>Total Users</span>
                <strong>{dashboard?.total_users ?? "-"}</strong>
              </article>
              <article className="card">
                <span>Total Memberships</span>
                <strong>{dashboard?.total_memberships ?? "-"}</strong>
              </article>
              <article className="card">
                <span>Catalog Items</span>
                <strong>{dashboard?.total_catalog_items ?? "-"}</strong>
              </article>
            </div>
            <p className="subtle">
              Categories: {(dashboard?.categories || []).join(", ") || "No categories yet"}
            </p>
          </section>
        )}

        {activeSection === "Memberships" && (
          <section className="two-col">
            <form className="panel grid" onSubmit={createMembership}>
              <h2>Add Membership</h2>
              {Object.entries(initialMembership).map(([key]) => (
                <label key={key}>
                  {key.replaceAll("_", " ")}
                  <input
                    type={key.includes("date") ? "date" : "text"}
                    value={membershipForm[key]}
                    onChange={(event) =>
                      setMembershipForm({ ...membershipForm, [key]: event.target.value })
                    }
                    required
                  />
                </label>
              ))}
              <button type="submit">Save Membership</button>
            </form>
            <section className="panel">
              <h2>Master List of Memberships</h2>
              <Table rows={memberships} />
            </section>
          </section>
        )}

        {activeSection === "Catalog" && (
          <section className="two-col">
            <form className="panel grid" onSubmit={createCatalog}>
              <h2>Add Book / Movie</h2>
              <label>
                Type
                <select
                  value={catalogForm.item_type}
                  onChange={(event) =>
                    setCatalogForm({ ...catalogForm, item_type: event.target.value })
                  }
                >
                  <option>Book</option>
                  <option>Movie</option>
                </select>
              </label>
              {Object.keys(initialCatalog)
                .filter((key) => key !== "item_type")
                .map((key) => (
                  <label key={key}>
                    {key.replaceAll("_", " ")}
                    <input
                      type={key.includes("date") ? "date" : "text"}
                      value={catalogForm[key]}
                      onChange={(event) =>
                        setCatalogForm({ ...catalogForm, [key]: event.target.value })
                      }
                      required={key !== "cost"}
                    />
                  </label>
                ))}
              <button type="submit">Save Item</button>
            </form>
            <section className="panel">
              <h2>Master List of Books and Movies</h2>
              <Table rows={catalog} />
            </section>
          </section>
        )}

        {activeSection === "Users" && user.role === "admin" && (
          <section className="two-col">
            <form className="panel grid" onSubmit={createUser}>
              <h2>User Management</h2>
              <label>
                Username
                <input
                  value={userForm.username}
                  onChange={(event) => setUserForm({ ...userForm, username: event.target.value })}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
                  required
                />
              </label>
              <label>
                Full Name
                <input
                  value={userForm.full_name}
                  onChange={(event) => setUserForm({ ...userForm, full_name: event.target.value })}
                  required
                />
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={userForm.is_admin}
                  onChange={(event) => setUserForm({ ...userForm, is_admin: event.target.checked })}
                />
                Admin
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={userForm.is_active}
                  onChange={(event) =>
                    setUserForm({ ...userForm, is_active: event.target.checked })
                  }
                />
                Active
              </label>
              <button type="submit">Save User</button>
            </form>
            <section className="panel">
              <h2>Users</h2>
              <Table rows={users} />
            </section>
          </section>
        )}

        {activeSection === "Transactions" && (
          <section className="stack">
            <form className="panel grid" onSubmit={searchCatalog}>
              <h2>Book Availability</h2>
              <label>
                Enter Book Name
                <input
                  value={search.title}
                  onChange={(event) => setSearch({ ...search, title: event.target.value })}
                />
              </label>
              <label>
                Enter Author
                <input
                  value={search.author_or_creator}
                  onChange={(event) =>
                    setSearch({ ...search, author_or_creator: event.target.value })
                  }
                />
              </label>
              <button type="submit">Search</button>
            </form>
            <section className="panel">
              <h2>Search Results</h2>
              <Table rows={searchResults} />
            </section>
            <div className="three-col">
              <form className="panel grid" onSubmit={issueItem}>
                <h2>Issue Book</h2>
                <SimpleNumberField label="Membership ID" value={issueForm.membership_id} onChange={(value) => setIssueForm({ ...issueForm, membership_id: value })} />
                <SimpleNumberField label="Catalog Item ID" value={issueForm.catalog_item_id} onChange={(value) => setIssueForm({ ...issueForm, catalog_item_id: value })} />
                <SimpleDateField label="Issue Date" value={issueForm.issue_date} onChange={(value) => setIssueForm({ ...issueForm, issue_date: value })} />
                <SimpleDateField label="Return Date" value={issueForm.due_date} onChange={(value) => setIssueForm({ ...issueForm, due_date: value })} />
                <label>
                  Remarks
                  <textarea value={issueForm.remarks} onChange={(event) => setIssueForm({ ...issueForm, remarks: event.target.value })} />
                </label>
                <button type="submit">Issue</button>
              </form>
              <form className="panel grid" onSubmit={returnItem}>
                <h2>Return Book</h2>
                <SimpleNumberField label="Issue ID" value={returnForm.issue_id} onChange={(value) => setReturnForm({ ...returnForm, issue_id: value })} />
                <SimpleDateField label="Actual Return Date" value={returnForm.actual_return_date} onChange={(value) => setReturnForm({ ...returnForm, actual_return_date: value })} />
                <label>
                  Remarks
                  <textarea value={returnForm.remarks} onChange={(event) => setReturnForm({ ...returnForm, remarks: event.target.value })} />
                </label>
                <button type="submit">Return</button>
              </form>
              <form className="panel grid" onSubmit={payFine}>
                <h2>Pay Fine</h2>
                <SimpleNumberField label="Issue ID" value={fineForm.issue_id} onChange={(value) => setFineForm({ ...fineForm, issue_id: value })} />
                <SimpleNumberField label="Amount" value={fineForm.amount} onChange={(value) => setFineForm({ ...fineForm, amount: value })} />
                <button type="submit">Pay</button>
              </form>
            </div>
          </section>
        )}

        {activeSection === "Reports" && (
          <section className="stack">
            <div className="report-tabs">
              <button onClick={() => loadReport("/reports/books")}>Master List of Books</button>
              <button onClick={() => loadReport("/reports/movies")}>Master List of Movies</button>
              <button onClick={() => loadReport("/reports/memberships")}>Master List of Memberships</button>
              <button onClick={() => loadReport("/reports/active-issues")}>Active Issues</button>
              <button onClick={() => loadReport("/reports/overdue-returns")}>Overdue Returns</button>
              <button onClick={() => loadReport("/reports/issue-requests")}>Issue Requests</button>
            </div>
            <section className="panel">
              <h2>Report View</h2>
              <Table rows={reportRows} />
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

function SimpleNumberField({ label, value, onChange }) {
  return (
    <label>
      {label}
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} required />
    </label>
  );
}

function SimpleDateField({ label, value, onChange }) {
  return (
    <label>
      {label}
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} required />
    </label>
  );
}

function Table({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="subtle">No records found.</p>;
  }

  const keys = Object.keys(rows[0]).filter((key) => !key.startsWith("_"));

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index}>
              {keys.map((key) => (
                <td key={key}>{String(row[key] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
