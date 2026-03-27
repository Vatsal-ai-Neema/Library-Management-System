import { useEffect, useState } from "react";
import { api } from "./api";

const libraryAdminSections = [
  "Dashboard",
  "Memberships",
  "Catalog",
  "Users",
  "Transactions",
  "Reports"
];
const libraryUserSections = ["Dashboard", "Transactions", "Reports"];
const businessSections = [
  "Customers",
  "Customer Detail",
  "Ledger",
  "Aging",
  "Products",
  "Indent Book",
  "Schemes",
  "Status",
  "Travel",
  "Expenses",
  "Farmers"
];

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

const initialBusinessCustomer = {
  code: "",
  name: "",
  address: "",
  phone_no: "",
  credit_limit: 0,
  advance_credit_limit: 0,
  balance: 0,
  outstanding: 0,
  available_normal_credit_limit: 0,
  available_advance_credit_limit: 0,
  last_payment: 0
};

export default function App() {
  const [systemChoice, setSystemChoice] = useState("library");
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [loginForm, setLoginForm] = useState({ username: "adm", password: "adm" });
  const [message, setMessage] = useState("");

  const [dashboard, setDashboard] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState({ title: "", author_or_creator: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [reportRows, setReportRows] = useState([]);
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
  const [returnForm, setReturnForm] = useState({ issue_id: 1, actual_return_date: "", remarks: "" });
  const [fineForm, setFineForm] = useState({ issue_id: 1, amount: 0 });

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerCode, setSelectedCustomerCode] = useState("DR-AP-0001");
  const [customerDetail, setCustomerDetail] = useState(null);
  const [ledgerRows, setLedgerRows] = useState([]);
  const [agingRows, setAgingRows] = useState([]);
  const [businessProducts, setBusinessProducts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [indents, setIndents] = useState([]);
  const [statusRows, setStatusRows] = useState([]);
  const [travelRows, setTravelRows] = useState([]);
  const [expenseRows, setExpenseRows] = useState([]);
  const [farmerRows, setFarmerRows] = useState([]);
  const [customerForm, setCustomerForm] = useState(initialBusinessCustomer);
  const [productForm, setProductForm] = useState({
    code: "",
    name: "",
    category: "",
    price: 0,
    highlighted_scheme: ""
  });
  const [indentForm, setIndentForm] = useState({
    customer_code: "DR-AP-0001",
    product_code: "FGMFN0018",
    quantity: 1,
    scheme_code: ""
  });
  const [travelForm, setTravelForm] = useState({
    travel_date: "",
    travel_time: "",
    from_location: "",
    to_location: "",
    customer_name: "",
    distance: 0
  });
  const [expenseForm, setExpenseForm] = useState({
    entry_date: "",
    customer_code: "DR-AP-0001",
    customer_name: "",
    journey_km: 0,
    ta_amount: 0,
    conveyance_amount: 0,
    da_amount: 0,
    telephone_amount: 0,
    repair_amount: 0,
    other_amount: 0,
    senior_approval: "no"
  });
  const [farmerForm, setFarmerForm] = useState({
    farmer_name: "",
    father_name: "",
    mobile_no: "",
    aadhar_card_no: "",
    village_name: "",
    district_name: "",
    season: "",
    demo_crop_name: "",
    purpose: ""
  });

  useEffect(() => {
    if (!user) return;
    if (user.system_type === "library") {
      loadLibrary();
    } else {
      loadBusiness();
    }
  }, [user]);

  async function loadLibrary() {
    setDashboard(await api("/dashboard"));
    setMemberships(await api("/memberships"));
    setCatalog(await api("/catalog"));
    if (user?.role === "admin") {
      setUsers(await api("/users"));
    }
    setReportRows(await api("/reports/books"));
  }

  async function loadBusiness() {
    const customersData = await api("/business/customers?target_only=true");
    setCustomers(customersData);
    setCustomerDetail(await api(`/business/customers/${selectedCustomerCode}`));
    setLedgerRows(await api(`/business/ledger?customer_code=${selectedCustomerCode}`));
    setAgingRows(await api("/business/aging"));
    setBusinessProducts(await api("/business/products"));
    setSchemes(await api("/business/schemes"));
    setIndents(await api("/business/indents"));
    setStatusRows(await api("/business/status"));
    setTravelRows(await api("/business/travel"));
    setExpenseRows(await api("/business/expenses"));
    setFarmerRows(await api("/business/farmers"));
  }

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const loggedIn = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm)
      });
      if (loggedIn.system_type !== systemChoice) {
        setMessage(`This user belongs to the ${loggedIn.system_type} system.`);
        return;
      }
      setUser(loggedIn);
      setActiveSection(loggedIn.system_type === "library" ? "Dashboard" : "Customers");
      setMessage(`Welcome ${loggedIn.full_name}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    setUser(null);
    setMessage("You have successfully logged out.");
  }

  async function createLibraryRecord(path, form, reset, successMessage) {
    try {
      await api(path, { method: "POST", body: JSON.stringify(form) });
      reset();
      setMessage(successMessage);
      await loadLibrary();
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

  async function createBusinessRecord(path, form, reset, successMessage) {
    try {
      await api(path, { method: "POST", body: JSON.stringify(form) });
      reset();
      setMessage(successMessage);
      await loadBusiness();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadCustomerContext(code) {
    setSelectedCustomerCode(code);
    setCustomerDetail(await api(`/business/customers/${code}`));
    setLedgerRows(await api(`/business/ledger?customer_code=${code}`));
  }

  if (!user) {
    return (
      <div className="shell shell-login">
        <div className="login-card">
          <p className="eyebrow">Workbook Submission</p>
          <h1>Two-System Full Stack</h1>
          <div className="toggle-row">
            <button className={systemChoice === "library" ? "toggle active-toggle" : "toggle"} onClick={() => { setSystemChoice("library"); setLoginForm({ username: "adm", password: "adm" }); }} type="button">Library</button>
            <button className={systemChoice === "business" ? "toggle active-toggle" : "toggle"} onClick={() => { setSystemChoice("business"); setLoginForm({ username: "HYD-118", password: "HYD-118" }); }} type="button">Business / CRM</button>
          </div>
          <p className="subtle">
            Library logins: `adm/adm`, `user/user`. Business login: `HYD-118/HYD-118`.
          </p>
          <form onSubmit={handleLogin} className="grid">
            <label>
              User ID
              <input value={loginForm.username} onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })} required />
            </label>
            <label>
              Password
              <input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} required />
            </label>
            <button type="submit">Login</button>
          </form>
          {message && <p className="status">{message}</p>}
        </div>
      </div>
    );
  }

  const sections =
    user.system_type === "library"
      ? user.role === "admin"
        ? libraryAdminSections
        : libraryUserSections
      : businessSections;

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="eyebrow">{user.system_type === "library" ? "Library Management System" : "Business / CRM + Sales System"}</p>
        <h2>{user.full_name}</h2>
        <nav>
          {sections.map((section) => (
            <button key={section} className={activeSection === section ? "nav-btn active" : "nav-btn"} onClick={() => setActiveSection(section)}>
              {section}
            </button>
          ))}
        </nav>
        <button className="logout-btn" onClick={logout}>Log Out</button>
      </aside>

      <main className="content">
        {message && <div className="alert">{message}</div>}

        {user.system_type === "library" && (
          <>
            {activeSection === "Dashboard" && <Dashboard dashboard={dashboard} />}
            {activeSection === "Memberships" && (
              <section className="two-col">
                <DataForm title="Add Membership" fields={initialMembership} form={membershipForm} setForm={setMembershipForm} onSubmit={(event) => { event.preventDefault(); createLibraryRecord("/memberships", membershipForm, () => setMembershipForm(initialMembership), "Membership created successfully"); }} />
                <DataPanel title="Master List of Memberships" rows={memberships} />
              </section>
            )}
            {activeSection === "Catalog" && (
              <section className="two-col">
                <CustomCatalogForm form={catalogForm} setForm={setCatalogForm} onSubmit={(event) => { event.preventDefault(); createLibraryRecord("/catalog", catalogForm, () => setCatalogForm(initialCatalog), "Catalog item created successfully"); }} />
                <DataPanel title="Master List of Books and Movies" rows={catalog} />
              </section>
            )}
            {activeSection === "Users" && user.role === "admin" && (
              <section className="two-col">
                <UserForm form={userForm} setForm={setUserForm} onSubmit={(event) => { event.preventDefault(); createLibraryRecord("/users", userForm, () => setUserForm({ username: "", password: "", full_name: "", is_admin: false, is_active: true }), "User created successfully"); }} />
                <DataPanel title="Users" rows={users} />
              </section>
            )}
            {activeSection === "Transactions" && (
              <section className="stack">
                <SearchForm search={search} setSearch={setSearch} onSubmit={searchCatalog} />
                <DataPanel title="Search Results" rows={searchResults} />
                <div className="three-col">
                  <IssueForm form={issueForm} setForm={setIssueForm} onSubmit={async (event) => { event.preventDefault(); await createLibraryRecord("/transactions/issue", issueForm, () => setIssueForm({ membership_id: 1, catalog_item_id: 1, issue_date: "", due_date: "", remarks: "" }), "Transaction completed successfully"); }} />
                  <ReturnForm form={returnForm} setForm={setReturnForm} onSubmit={async (event) => { event.preventDefault(); await createLibraryRecord("/transactions/return", returnForm, () => setReturnForm({ issue_id: 1, actual_return_date: "", remarks: "" }), "Return completed successfully"); }} />
                  <FineForm form={fineForm} setForm={setFineForm} onSubmit={async (event) => { event.preventDefault(); await createLibraryRecord("/transactions/pay-fine", fineForm, () => setFineForm({ issue_id: 1, amount: 0 }), "Fine payment recorded"); }} />
                </div>
              </section>
            )}
            {activeSection === "Reports" && (
              <section className="stack">
                <div className="report-tabs">
                  <button onClick={() => loadLibraryReport("/reports/books")}>Master List of Books</button>
                  <button onClick={() => loadLibraryReport("/reports/movies")}>Master List of Movies</button>
                  <button onClick={() => loadLibraryReport("/reports/memberships")}>Master List of Memberships</button>
                  <button onClick={() => loadLibraryReport("/reports/active-issues")}>Active Issues</button>
                  <button onClick={() => loadLibraryReport("/reports/overdue-returns")}>Overdue Returns</button>
                  <button onClick={() => loadLibraryReport("/reports/issue-requests")}>Issue Requests</button>
                </div>
                <DataPanel title="Report View" rows={reportRows} />
              </section>
            )}
          </>
        )}

        {user.system_type === "business" && (
          <>
            {activeSection === "Customers" && (
              <section className="two-col">
                <DataForm title="Add Customer" fields={initialBusinessCustomer} form={customerForm} setForm={setCustomerForm} onSubmit={(event) => { event.preventDefault(); createBusinessRecord("/business/customers", customerForm, () => setCustomerForm(initialBusinessCustomer), "Customer created successfully"); }} />
                <section className="panel stack">
                  <h2>Customer List</h2>
                  <div className="inline-row">
                    {customers.map((customer) => (
                      <button key={customer.code} onClick={() => loadCustomerContext(customer.code)}>{customer.code}</button>
                    ))}
                  </div>
                  <Table rows={customers} />
                </section>
              </section>
            )}
            {activeSection === "Customer Detail" && <DataPanel title="Customer Detail" rows={customerDetail ? [customerDetail] : []} />}
            {activeSection === "Ledger" && <DataPanel title="Ledger Info" rows={ledgerRows} />}
            {activeSection === "Aging" && <DataPanel title="Aging" rows={agingRows} />}
            {activeSection === "Products" && (
              <section className="two-col">
                <DataForm title="Add Product" fields={{ code: "", name: "", category: "", price: 0, highlighted_scheme: "" }} form={productForm} setForm={setProductForm} onSubmit={(event) => { event.preventDefault(); createBusinessRecord("/business/products", productForm, () => setProductForm({ code: "", name: "", category: "", price: 0, highlighted_scheme: "" }), "Product created successfully"); }} />
                <DataPanel title="Product List" rows={businessProducts} />
              </section>
            )}
            {activeSection === "Indent Book" && (
              <section className="two-col">
                <DataForm title="Book Indent" fields={{ customer_code: "DR-AP-0001", product_code: "FGMFN0018", quantity: 1, scheme_code: "" }} form={indentForm} setForm={setIndentForm} onSubmit={(event) => { event.preventDefault(); createBusinessRecord("/business/indents", indentForm, () => setIndentForm({ customer_code: "DR-AP-0001", product_code: "FGMFN0018", quantity: 1, scheme_code: "" }), "Indent booked successfully"); }} />
                <DataPanel title="Indents" rows={indents} />
              </section>
            )}
            {activeSection === "Schemes" && <DataPanel title="Scheme List" rows={schemes} />}
            {activeSection === "Status" && <DataPanel title="Order Status" rows={statusRows} />}
            {activeSection === "Travel" && (
              <section className="two-col">
                <DataForm title="Travel Report" fields={{ travel_date: "", travel_time: "", from_location: "", to_location: "", customer_name: "", distance: 0 }} form={travelForm} setForm={setTravelForm} onSubmit={(event) => { event.preventDefault(); createBusinessRecord("/business/travel", travelForm, () => setTravelForm({ travel_date: "", travel_time: "", from_location: "", to_location: "", customer_name: "", distance: 0 }), "Travel entry created successfully"); }} />
                <DataPanel title="Travel Entries" rows={travelRows} />
              </section>
            )}
            {activeSection === "Expenses" && (
              <section className="two-col">
                <DataForm title="T.A D.A" fields={{ entry_date: "", customer_code: "DR-AP-0001", customer_name: "", journey_km: 0, ta_amount: 0, conveyance_amount: 0, da_amount: 0, telephone_amount: 0, repair_amount: 0, other_amount: 0, senior_approval: "no" }} form={expenseForm} setForm={setExpenseForm} onSubmit={(event) => { event.preventDefault(); createBusinessRecord("/business/expenses", expenseForm, () => setExpenseForm({ entry_date: "", customer_code: "DR-AP-0001", customer_name: "", journey_km: 0, ta_amount: 0, conveyance_amount: 0, da_amount: 0, telephone_amount: 0, repair_amount: 0, other_amount: 0, senior_approval: "no" }), "Expense entry created successfully"); }} />
                <DataPanel title="Expense Entries" rows={expenseRows} />
              </section>
            )}
            {activeSection === "Farmers" && (
              <section className="two-col">
                <DataForm title="Farmer Demo" fields={{ farmer_name: "", father_name: "", mobile_no: "", aadhar_card_no: "", village_name: "", district_name: "", season: "", demo_crop_name: "", purpose: "" }} form={farmerForm} setForm={setFarmerForm} onSubmit={(event) => { event.preventDefault(); createBusinessRecord("/business/farmers", farmerForm, () => setFarmerForm({ farmer_name: "", father_name: "", mobile_no: "", aadhar_card_no: "", village_name: "", district_name: "", season: "", demo_crop_name: "", purpose: "" }), "Farmer demo entry created successfully"); }} />
                <DataPanel title="Farmer Demo Records" rows={farmerRows} />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );

  async function loadLibraryReport(path) {
    setReportRows(await api(path));
  }
}

function Dashboard({ dashboard }) {
  return (
    <section className="panel stack">
      <h1>Dashboard</h1>
      <div className="cards">
        <article className="card"><span>Total Users</span><strong>{dashboard?.total_users ?? "-"}</strong></article>
        <article className="card"><span>Total Memberships</span><strong>{dashboard?.total_memberships ?? "-"}</strong></article>
        <article className="card"><span>Catalog Items</span><strong>{dashboard?.total_catalog_items ?? "-"}</strong></article>
      </div>
      <p className="subtle">Categories: {(dashboard?.categories || []).join(", ") || "No categories yet"}</p>
    </section>
  );
}

function DataForm({ title, fields, form, setForm, onSubmit }) {
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>{title}</h2>
      {Object.keys(fields).map((key) => (
        <label key={key}>
          {key.replaceAll("_", " ")}
          <input
            type={key.includes("date") ? "date" : typeof fields[key] === "number" ? "number" : "text"}
            value={form[key]}
            onChange={(event) =>
              setForm({
                ...form,
                [key]: typeof fields[key] === "number" ? Number(event.target.value) : event.target.value
              })
            }
            required
          />
        </label>
      ))}
      <button type="submit">Save</button>
    </form>
  );
}

function CustomCatalogForm({ form, setForm, onSubmit }) {
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>Add Book / Movie</h2>
      <label>
        Type
        <select value={form.item_type} onChange={(event) => setForm({ ...form, item_type: event.target.value })}>
          <option>Book</option>
          <option>Movie</option>
        </select>
      </label>
      {["title", "author_or_creator", "category", "procurement_date", "quantity", "cost"].map((key) => (
        <label key={key}>
          {key.replaceAll("_", " ")}
          <input
            type={key.includes("date") ? "date" : key === "quantity" || key === "cost" ? "number" : "text"}
            value={form[key]}
            onChange={(event) => setForm({ ...form, [key]: key === "quantity" || key === "cost" ? Number(event.target.value) : event.target.value })}
            required={key !== "cost"}
          />
        </label>
      ))}
      <button type="submit">Save Item</button>
    </form>
  );
}

function UserForm({ form, setForm, onSubmit }) {
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>User Management</h2>
      {["username", "password", "full_name"].map((key) => (
        <label key={key}>
          {key.replaceAll("_", " ")}
          <input type={key === "password" ? "password" : "text"} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required />
        </label>
      ))}
      <label className="check-row"><input type="checkbox" checked={form.is_admin} onChange={(event) => setForm({ ...form, is_admin: event.target.checked })} />Admin</label>
      <label className="check-row"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Active</label>
      <button type="submit">Save User</button>
    </form>
  );
}

function SearchForm({ search, setSearch, onSubmit }) {
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>Book Availability</h2>
      <label>Enter Book Name<input value={search.title} onChange={(event) => setSearch({ ...search, title: event.target.value })} /></label>
      <label>Enter Author<input value={search.author_or_creator} onChange={(event) => setSearch({ ...search, author_or_creator: event.target.value })} /></label>
      <button type="submit">Search</button>
    </form>
  );
}

function IssueForm({ form, setForm, onSubmit }) {
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>Issue Book</h2>
      <NumberField label="Membership ID" value={form.membership_id} onChange={(value) => setForm({ ...form, membership_id: value })} />
      <NumberField label="Catalog Item ID" value={form.catalog_item_id} onChange={(value) => setForm({ ...form, catalog_item_id: value })} />
      <DateField label="Issue Date" value={form.issue_date} onChange={(value) => setForm({ ...form, issue_date: value })} />
      <DateField label="Return Date" value={form.due_date} onChange={(value) => setForm({ ...form, due_date: value })} />
      <label>Remarks<textarea value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} /></label>
      <button type="submit">Issue</button>
    </form>
  );
}

function ReturnForm({ form, setForm, onSubmit }) {
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>Return Book</h2>
      <NumberField label="Issue ID" value={form.issue_id} onChange={(value) => setForm({ ...form, issue_id: value })} />
      <DateField label="Actual Return Date" value={form.actual_return_date} onChange={(value) => setForm({ ...form, actual_return_date: value })} />
      <label>Remarks<textarea value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} /></label>
      <button type="submit">Return</button>
    </form>
  );
}

function FineForm({ form, setForm, onSubmit }) {
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>Pay Fine</h2>
      <NumberField label="Issue ID" value={form.issue_id} onChange={(value) => setForm({ ...form, issue_id: value })} />
      <NumberField label="Amount" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} />
      <button type="submit">Pay</button>
    </form>
  );
}

function NumberField({ label, value, onChange }) {
  return <label>{label}<input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} required /></label>;
}

function DateField({ label, value, onChange }) {
  return <label>{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} required /></label>;
}

function DataPanel({ title, rows }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <Table rows={rows} />
    </section>
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
        <thead><tr>{keys.map((key) => <th key={key}>{key}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? row.code ?? index}>
              {keys.map((key) => <td key={key}>{String(row[key] ?? "")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
