import { useEffect, useState } from "react";
import { api } from "./api";

const adminSections = ["Dashboard", "Memberships", "Catalog", "Users", "Transactions", "Reports"];
const userSections = ["Dashboard", "Transactions", "Reports"];
const initialMembership = { membership_code: "", first_name: "", last_name: "", contact_number: "", contact_address: "", aadhar_number: "", start_date: "", end_date: "" };
const initialMembershipUpdate = { membership_id: "", start_date: "", end_date: "", status: "Active" };
const initialCatalog = { item_type: "Book", title: "", author_or_creator: "", category: "", procurement_date: "", quantity: 1, cost: 0 };
const initialCatalogUpdate = { item_id: "", item_type: "Book", procurement_date: "", quantity: 1, status: "Available" };
const blankUser = { username: "", password: "", full_name: "", is_admin: false, is_active: true };

export default function App() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [loginForm, setLoginForm] = useState({ username: "adm", password: "adm" });
  const [message, setMessage] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeIssues, setActiveIssues] = useState([]);
  const [reportRows, setReportRows] = useState([]);
  const [search, setSearch] = useState({ title: "", author_or_creator: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchItemId, setSelectedSearchItemId] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [pendingFineIssue, setPendingFineIssue] = useState(null);
  const [membershipForm, setMembershipForm] = useState(initialMembership);
  const [membershipDurationMonths, setMembershipDurationMonths] = useState(6);
  const [membershipDurationMode, setMembershipDurationMode] = useState("preset");
  const [membershipUpdateForm, setMembershipUpdateForm] = useState(initialMembershipUpdate);
  const [membershipExtensionMonths, setMembershipExtensionMonths] = useState(6);
  const [membershipCancel, setMembershipCancel] = useState(false);
  const [catalogForm, setCatalogForm] = useState(initialCatalog);
  const [catalogUpdateForm, setCatalogUpdateForm] = useState(initialCatalogUpdate);
  const [userForm, setUserForm] = useState(blankUser);
  const [userMode, setUserMode] = useState("new");
  const [existingUserId, setExistingUserId] = useState("");
  const [issueForm, setIssueForm] = useState({ membership_id: 1, catalog_item_id: 1, issue_date: "", due_date: "", remarks: "" });
  const [returnForm, setReturnForm] = useState({ issue_id: 1, actual_return_date: "", remarks: "" });
  const [fineForm, setFineForm] = useState({ issue_id: 1, amount: 0 });
  const [finePaidChecked, setFinePaidChecked] = useState(false);

  useEffect(() => { if (user) loadLibrary(); }, [user]);

  async function loadLibrary() {
    setDashboard(await api("/dashboard"));
    const membershipsData = await api("/memberships");
    const catalogData = await api("/catalog");
    const issuesData = await api("/transactions/active-issues");
    setMemberships(membershipsData);
    setCatalog(catalogData);
    setActiveIssues(issuesData);
    if (user?.role === "admin") setUsers(await api("/users"));
    setReportRows(await api("/reports/books"));
  }

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const loggedIn = await api("/auth/login", { method: "POST", body: JSON.stringify(loginForm) });
      if (loggedIn.system_type && loggedIn.system_type !== "library") {
        setMessage("Business/CRM is removed from this local setup. Use library users only.");
        return;
      }
      setUser(loggedIn);
      setActiveSection("Dashboard");
      setPendingFineIssue(null);
      setMessage(`Welcome ${loggedIn.full_name}`);
    } catch (error) { setMessage(error.message); }
  }

  function logout() { setUser(null); setMessage("You have successfully logged out."); }
  async function createLibraryRecord(path, form, reset, successMessage) { try { await api(path, { method: "POST", body: JSON.stringify(form) }); reset(); setMessage(successMessage); await loadLibrary(); } catch (error) { setMessage(error.message); } }
  async function updateLibraryRecord(path, form, successMessage) { try { await api(path, { method: "PUT", body: JSON.stringify(form) }); setMessage(successMessage); await loadLibrary(); } catch (error) { setMessage(error.message); } }

  async function searchCatalog(event) {
    event.preventDefault();
    try {
      const params = new URLSearchParams();
      if (search.title) params.set("title", search.title);
      if (search.author_or_creator) params.set("author_or_creator", search.author_or_creator);
      setSearchResults(await api(`/catalog/search?${params.toString()}`));
      setSelectedSearchItemId(null);
    } catch (error) { setMessage(error.message); }
  }

  async function submitMembership(event) {
    event.preventDefault();
    const startDate = membershipForm.start_date || new Date().toISOString().slice(0, 10);
    let computedEndDate = membershipForm.end_date;
    if (membershipDurationMode === "preset") {
      const end = new Date(startDate);
      end.setMonth(end.getMonth() + membershipDurationMonths);
      computedEndDate = end.toISOString().slice(0, 10);
    }
    if (!computedEndDate) return setMessage("End date is required");
    if (computedEndDate < startDate) return setMessage("End date cannot be before start date");
    await createLibraryRecord("/memberships", { ...membershipForm, start_date: startDate, end_date: computedEndDate }, () => { setMembershipForm(initialMembership); setMembershipDurationMonths(6); setMembershipDurationMode("preset"); }, "Membership created successfully");
  }

  const selectedMembershipForUpdate = memberships.find((m) => m.id === Number(membershipUpdateForm.membership_id));
  useEffect(() => { if (selectedMembershipForUpdate) { setMembershipUpdateForm({ membership_id: selectedMembershipForUpdate.id, start_date: selectedMembershipForUpdate.start_date, end_date: selectedMembershipForUpdate.end_date, status: selectedMembershipForUpdate.status }); setMembershipCancel(selectedMembershipForUpdate.status !== "Active"); } }, [selectedMembershipForUpdate]);
  async function submitMembershipUpdate() {
    if (!membershipUpdateForm.membership_id) return setMessage("Membership Number is mandatory");
    const end = new Date(selectedMembershipForUpdate?.end_date || membershipUpdateForm.end_date || new Date());
    if (!membershipCancel) end.setMonth(end.getMonth() + membershipExtensionMonths);
    await updateLibraryRecord(`/memberships/${membershipUpdateForm.membership_id}`, { start_date: membershipUpdateForm.start_date || undefined, end_date: membershipCancel ? membershipUpdateForm.end_date || undefined : end.toISOString().slice(0, 10), status: membershipCancel ? "Inactive" : "Active" }, "Membership updated successfully");
  }

  async function submitCatalogUpdate() {
    if (!catalogUpdateForm.item_id) return setMessage("Book/Movie selection is mandatory");
    await updateLibraryRecord(`/catalog/${catalogUpdateForm.item_id}`, { procurement_date: catalogUpdateForm.procurement_date || undefined, quantity: Number(catalogUpdateForm.quantity), status: catalogUpdateForm.status }, "Catalog item updated successfully");
  }

  const selectedCatalogItem = catalog.find((item) => item.id === Number(selectedSearchItemId));
  const selectedMembership = memberships.find((m) => m.id === Number(issueForm.membership_id));
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setIssueForm((cur) => ({ ...cur, catalog_item_id: selectedCatalogItem?.id ?? cur.catalog_item_id, issue_date: cur.issue_date || today, due_date: cur.due_date || due }));
  }, [selectedCatalogItem]);
  async function submitIssue(event) {
    event.preventDefault();
    if (!selectedCatalogItem) return setMessage("Select one book from the search results to issue");
    await createLibraryRecord("/transactions/issue", { ...issueForm, catalog_item_id: selectedCatalogItem.id }, () => setIssueForm({ membership_id: issueForm.membership_id, catalog_item_id: selectedCatalogItem.id, issue_date: "", due_date: "", remarks: "" }), "Transaction completed successfully");
  }

  const selectedActiveIssue = activeIssues.find((issue) => issue.id === Number(selectedIssueId));
  const selectedReturnItem = catalog.find((item) => item.id === Number(selectedActiveIssue?.catalog_item_id));
  useEffect(() => { if (selectedActiveIssue) { setReturnForm({ issue_id: selectedActiveIssue.id, actual_return_date: selectedActiveIssue.due_date, remarks: "" }); setFineForm({ issue_id: selectedActiveIssue.id, amount: Number(selectedActiveIssue.fine_amount || 0) }); } }, [selectedActiveIssue]);
  async function submitReturn(event) {
    event.preventDefault();
    if (!selectedActiveIssue) return setMessage("Select one issued book to return");
    try {
      const response = await api("/transactions/return", { method: "POST", body: JSON.stringify(returnForm) });
      setPendingFineIssue(response.issue);
      setFineForm({ issue_id: response.issue.id, amount: Number(response.fine_amount || 0) });
      setMessage(response.message);
      await loadLibrary();
    } catch (error) { setMessage(error.message); }
  }

  async function submitFine(event) {
    event.preventDefault();
    try {
      if (Number(pendingFineIssue?.fine_amount ?? 0) > 0 && !finePaidChecked) return setMessage("For a pending fine, the paid fine checkbox needs to be selected");
      const response = await api("/transactions/pay-fine", { method: "POST", body: JSON.stringify(fineForm) });
      setPendingFineIssue(null);
      setFinePaidChecked(false);
      setMessage(`Fine payment recorded. Remaining: ${response.remaining_pending_amount}`);
      await loadLibrary();
    } catch (error) { setMessage(error.message); }
  }

  const selectedUser = users.find((entry) => entry.id === Number(existingUserId));
  useEffect(() => { if (selectedUser && userMode === "existing") setUserForm({ username: selectedUser.username, password: selectedUser.password ?? "", full_name: selectedUser.full_name, is_admin: selectedUser.is_admin, is_active: selectedUser.is_active }); }, [selectedUser, userMode]);
  async function submitUser(event) {
    event.preventDefault();
    if (userMode === "new") {
      await createLibraryRecord("/users", userForm, () => setUserForm(blankUser), "User created successfully");
    } else if (existingUserId) {
      await updateLibraryRecord(`/users/${existingUserId}`, { full_name: userForm.full_name, is_admin: userForm.is_admin, is_active: userForm.is_active }, "User updated successfully");
    } else setMessage("Select an existing user");
  }

  async function loadReport(path) {
    try {
      setReportRows(await api(path));
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (!user) return (
    <div className="shell shell-login"><div className="login-card"><p className="eyebrow">Library Management System</p><h1>Role Based Access</h1><p className="subtle">Use `adm/adm` for admin or `user/user` for user.</p><form onSubmit={handleLogin} className="grid"><label>User ID<input value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} required /></label><label>Password<input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required /></label><button type="submit">Login</button></form>{message && <p className="status">{message}</p>}</div></div>
  );

  const sections = user.role === "admin" ? adminSections : userSections;
  return (
    <div className="shell">
      <aside className="sidebar"><p className="eyebrow">Library Management System</p><h2>{user.full_name}</h2><nav>{sections.map((section) => <button key={section} className={activeSection === section ? "nav-btn active" : "nav-btn"} onClick={() => setActiveSection(section)}>{section}</button>)}</nav><button className="logout-btn" onClick={logout}>Log Out</button></aside>
      <main className="content">
        {message && <div className="alert">{message}</div>}
        {activeSection === "Dashboard" && <Dashboard dashboard={dashboard} />}
        {activeSection === "Memberships" && <section className="two-col"><section className="stack"><DataForm title="Add Membership" fields={initialMembership} form={membershipForm} setForm={setMembershipForm} onSubmit={submitMembership} /><section className="panel stack"><h2>Membership Duration</h2><div className="inline-row">{[6, 12, 24].map((months) => <label key={months} className="radio-row"><input type="radio" checked={membershipDurationMode === "preset" && membershipDurationMonths === months} onChange={() => { setMembershipDurationMode("preset"); setMembershipDurationMonths(months); }} />{months === 6 ? "6 months" : months === 12 ? "1 year" : "2 years"}</label>)}<label className="radio-row"><input type="radio" checked={membershipDurationMode === "custom"} onChange={() => setMembershipDurationMode("custom")} />Custom end date</label></div></section><section className="panel stack"><h2>Update Membership</h2><label>Membership Number<select value={membershipUpdateForm.membership_id} onChange={(e) => setMembershipUpdateForm({ ...membershipUpdateForm, membership_id: e.target.value })} required><option value="">Select membership</option>{memberships.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}</select></label><label>Start date<input value={membershipUpdateForm.start_date} readOnly /></label><label>End date<input value={membershipUpdateForm.end_date} readOnly /></label><div className="inline-row">{[6, 12, 24].map((months) => <label key={months} className="radio-row"><input type="radio" checked={membershipExtensionMonths === months} onChange={() => setMembershipExtensionMonths(months)} disabled={membershipCancel} />{months === 6 ? "6 months" : months === 12 ? "1 year" : "2 years"}</label>)}</div><label className="check-row"><input type="checkbox" checked={membershipCancel} onChange={(e) => setMembershipCancel(e.target.checked)} />Cancel membership</label><button type="button" onClick={submitMembershipUpdate}>Save</button></section></section><DataPanel title="Master List of Memberships" rows={memberships} /></section>}
        {activeSection === "Catalog" && <section className="two-col"><section className="stack"><CustomCatalogForm form={catalogForm} setForm={setCatalogForm} onSubmit={(e) => { e.preventDefault(); createLibraryRecord("/catalog", catalogForm, () => setCatalogForm(initialCatalog), "Catalog item created successfully"); }} /><section className="panel grid"><h2>Update Book / Movie</h2><label>Type<select value={catalogUpdateForm.item_type} onChange={(e) => setCatalogUpdateForm({ ...catalogUpdateForm, item_type: e.target.value, item_id: "" })}><option>Book</option><option>Movie</option></select></label><label>Book / Movie<select value={catalogUpdateForm.item_id} onChange={(e) => { const item = catalog.find((entry) => entry.id === Number(e.target.value)); setCatalogUpdateForm({ ...catalogUpdateForm, item_id: e.target.value, procurement_date: item?.procurement_date ?? "", quantity: item?.quantity ?? 1, status: item?.status ?? "Available" }); }} required><option value="">Select item</option>{catalog.filter((entry) => entry.item_type === catalogUpdateForm.item_type).map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}</select></label><label>Procurement date<input type="date" value={catalogUpdateForm.procurement_date} onChange={(e) => setCatalogUpdateForm({ ...catalogUpdateForm, procurement_date: e.target.value })} required /></label><label>Quantity<input type="number" min="1" value={catalogUpdateForm.quantity} onChange={(e) => setCatalogUpdateForm({ ...catalogUpdateForm, quantity: Number(e.target.value) })} required /></label><label>Status<select value={catalogUpdateForm.status} onChange={(e) => setCatalogUpdateForm({ ...catalogUpdateForm, status: e.target.value })} required><option>Available</option><option>Unavailable</option></select></label><button type="button" onClick={submitCatalogUpdate}>Save</button></section></section><DataPanel title="Master List of Books and Movies" rows={catalog} /></section>}
        {activeSection === "Users" && user.role === "admin" && <section className="two-col"><UserForm form={userForm} setForm={setUserForm} userMode={userMode} setUserMode={setUserMode} existingUserId={existingUserId} setExistingUserId={setExistingUserId} users={users} onSubmit={submitUser} /><DataPanel title="Users" rows={users} /></section>}
        {activeSection === "Transactions" && <section className="stack"><SearchForm search={search} setSearch={setSearch} onSubmit={searchCatalog} /><SearchResultsPanel rows={searchResults} selectedId={selectedSearchItemId} onSelect={setSelectedSearchItemId} /><div className="three-col"><IssueForm form={issueForm} setForm={setIssueForm} selectedItem={selectedCatalogItem} selectedMembership={selectedMembership} onSubmit={submitIssue} /><ReturnForm form={returnForm} setForm={setReturnForm} activeIssues={activeIssues} selectedIssueId={selectedIssueId} setSelectedIssueId={setSelectedIssueId} selectedItem={selectedReturnItem} onSubmit={submitReturn} /><FineForm form={fineForm} setForm={setFineForm} pendingFineIssue={pendingFineIssue} selectedItem={selectedReturnItem} finePaidChecked={finePaidChecked} setFinePaidChecked={setFinePaidChecked} onSubmit={submitFine} /></div></section>}
        {activeSection === "Reports" && <section className="stack"><div className="report-tabs"><button onClick={() => loadReport("/reports/books")}>Master List of Books</button><button onClick={() => loadReport("/reports/movies")}>Master List of Movies</button><button onClick={() => loadReport("/reports/memberships")}>Master List of Memberships</button><button onClick={() => loadReport("/reports/active-issues")}>Active Issues</button><button onClick={() => loadReport("/reports/overdue-returns")}>Overdue Returns</button><button onClick={() => loadReport("/reports/issue-requests")}>Issue Requests</button></div><DataPanel title="Report View" rows={reportRows} /></section>}
      </main>
    </div>
  );
}

function Dashboard({ dashboard }) { return <section className="panel stack"><h1>Dashboard</h1><div className="cards"><article className="card"><span>Total Users</span><strong>{dashboard?.total_users ?? "-"}</strong></article><article className="card"><span>Total Memberships</span><strong>{dashboard?.total_memberships ?? "-"}</strong></article><article className="card"><span>Catalog Items</span><strong>{dashboard?.total_catalog_items ?? "-"}</strong></article></div><p className="subtle">Categories: {(dashboard?.categories || []).join(", ") || "No categories yet"}</p></section>; }
function DataForm({ title, fields, form, setForm, onSubmit }) { return <form className="panel grid" onSubmit={onSubmit}><h2>{title}</h2>{Object.keys(fields).map((key) => <label key={key}>{key.replaceAll("_", " ")}<input type={key.includes("date") ? "date" : typeof fields[key] === "number" ? "number" : "text"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: typeof fields[key] === "number" ? Number(e.target.value) : e.target.value })} required /></label>)}<button type="submit">Save</button></form>; }
function CustomCatalogForm({ form, setForm, onSubmit }) { return <form className="panel grid" onSubmit={onSubmit}><h2>Add Book / Movie</h2><label>Type<select value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value })}><option>Book</option><option>Movie</option></select></label>{["title", "author_or_creator", "category", "procurement_date", "quantity", "cost"].map((key) => <label key={key}>{key.replaceAll("_", " ")}<input type={key.includes("date") ? "date" : key === "quantity" || key === "cost" ? "number" : "text"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: key === "quantity" || key === "cost" ? Number(e.target.value) : e.target.value })} required={key !== "cost"} /></label>)}<button type="submit">Save Item</button></form>; }
function UserForm({ form, setForm, userMode, setUserMode, existingUserId, setExistingUserId, users, onSubmit }) { return <form className="panel grid" onSubmit={onSubmit}><h2>User Management</h2><div className="inline-row"><label className="radio-row"><input type="radio" checked={userMode === "new"} onChange={() => { setUserMode("new"); setExistingUserId(""); setForm(blankUser); }} />New user</label><label className="radio-row"><input type="radio" checked={userMode === "existing"} onChange={() => setUserMode("existing")} />Existing user</label></div>{userMode === "existing" && <label>Existing user<select value={existingUserId} onChange={(e) => setExistingUserId(e.target.value)} required><option value="">Select user</option>{users.map((entry) => <option key={entry.id} value={entry.id}>{entry.username}</option>)}</select></label>}{["username", "password", "full_name"].map((key) => <label key={key}>{key.replaceAll("_", " ")}<input type={key === "password" ? "password" : "text"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={key === "full_name" || userMode === "new"} readOnly={userMode === "existing" && key === "username"} /></label>)}<label className="check-row"><input type="checkbox" checked={form.is_admin} onChange={(e) => setForm({ ...form, is_admin: e.target.checked })} />Admin</label><label className="check-row"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />Active</label><button type="submit">Save User</button></form>; }
function SearchForm({ search, setSearch, onSubmit }) { return <form className="panel grid" onSubmit={onSubmit}><h2>Book Availability</h2><label>Enter Book Name<input value={search.title} onChange={(e) => setSearch({ ...search, title: e.target.value })} /></label><label>Enter Author<input value={search.author_or_creator} onChange={(e) => setSearch({ ...search, author_or_creator: e.target.value })} /></label><button type="submit">Search</button></form>; }
function SearchResultsPanel({ rows, selectedId, onSelect }) { return <section className="panel"><h2>Search Results</h2>{!rows?.length ? <p className="subtle">No records found.</p> : <div className="table-wrap"><table><thead><tr><th>Book Name</th><th>Author</th><th>Available</th><th>Select to issue</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.title}</td><td>{row.author_or_creator}</td><td>{row.quantity > 0 ? "Y" : "N"}</td><td><input type="radio" name="issue-book" checked={selectedId === row.id} onChange={() => onSelect(row.id)} disabled={row.quantity <= 0} /></td></tr>)}</tbody></table></div>}</section>; }
function IssueForm({ form, setForm, selectedItem, selectedMembership, onSubmit }) { const maxReturnDate = form.issue_date ? new Date(new Date(form.issue_date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : ""; return <form className="panel grid" onSubmit={onSubmit}><h2>Issue Book</h2><NumberField label="Membership ID" value={form.membership_id} onChange={(value) => setForm({ ...form, membership_id: value })} /><label>Name of book<input value={selectedItem?.title ?? ""} readOnly required /></label><label>Author name<input value={selectedItem?.author_or_creator ?? ""} readOnly /></label><DateField label="Issue Date" min={new Date().toISOString().slice(0, 10)} value={form.issue_date} onChange={(value) => setForm({ ...form, issue_date: value })} /><DateField label="Return Date" min={form.issue_date} max={maxReturnDate} value={form.due_date} onChange={(value) => setForm({ ...form, due_date: value })} /><label>Remarks<textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></label>{selectedMembership && <p className="subtle">Membership status: {selectedMembership.status}</p>}<button type="submit">Issue</button></form>; }
function ReturnForm({ form, setForm, activeIssues, selectedIssueId, setSelectedIssueId, selectedItem, onSubmit }) { return <form className="panel grid" onSubmit={onSubmit}><h2>Return Book</h2><label>Serial No of the book<select value={selectedIssueId} onChange={(e) => setSelectedIssueId(e.target.value)} required><option value="">Select issued book</option>{activeIssues.map((issue) => <option key={issue.id} value={issue.id}>{issue.id}</option>)}</select></label><label>Name of Book<input value={selectedItem?.title ?? ""} readOnly required /></label><label>Author name<input value={selectedItem?.author_or_creator ?? ""} readOnly /></label><label>Issue Date<input value={selectedIssueId ? activeIssues.find((issue) => issue.id === Number(selectedIssueId))?.issue_date ?? "" : ""} readOnly /></label><DateField label="Return Date" value={form.actual_return_date} onChange={(value) => setForm({ ...form, actual_return_date: value })} /><label>Remarks<textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></label><button type="submit">Confirm Return</button></form>; }
function FineForm({ form, setForm, pendingFineIssue, selectedItem, finePaidChecked, setFinePaidChecked, onSubmit }) { return <form className="panel grid" onSubmit={onSubmit}><h2>Pay Fine</h2><label>Issue ID<input value={form.issue_id} readOnly /></label><label>Name of Book<input value={selectedItem?.title ?? ""} readOnly /></label><label>Fine Calculated<input value={pendingFineIssue?.fine_amount ?? form.amount ?? 0} readOnly /></label><NumberField label="Fine Paid" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} /><label className="check-row"><input type="checkbox" checked={finePaidChecked} onChange={(e) => setFinePaidChecked(e.target.checked)} />Fine Paid</label><label>Remarks<textarea defaultValue="" placeholder="Optional remarks" /></label><button type="submit">{Number(pendingFineIssue?.fine_amount ?? 0) > 0 ? "Pay Fine" : "Confirm"}</button></form>; }
function NumberField({ label, value, onChange }) { return <label>{label}<input type="number" min="0" value={value} onChange={(e) => onChange(Number(e.target.value))} required /></label>; }
function DateField({ label, value, onChange, min, max }) { return <label>{label}<input type="date" value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} required /></label>; }
function DataPanel({ title, rows }) { return <section className="panel"><h2>{title}</h2><Table rows={rows} /></section>; }
function Table({ rows }) { if (!rows || rows.length === 0) return <p className="subtle">No records found.</p>; const keys = Object.keys(rows[0]).filter((key) => !key.startsWith("_")); return <div className="table-wrap"><table><thead><tr>{keys.map((key) => <th key={key}>{key}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id ?? index}>{keys.map((key) => <td key={key}>{String(row[key] ?? "")}</td>)}</tr>)}</tbody></table></div>; }
