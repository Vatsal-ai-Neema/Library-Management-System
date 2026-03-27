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

const initialMembershipUpdate = {
  membership_id: "",
  start_date: "",
  end_date: "",
  status: "Active"
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

const initialCatalogUpdate = {
  item_id: "",
  item_type: "Book",
  procurement_date: "",
  quantity: 1,
  status: "Available"
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
  const [selectedSearchItemId, setSelectedSearchItemId] = useState(null);
  const [activeIssues, setActiveIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [pendingFineIssue, setPendingFineIssue] = useState(null);
  const [reportRows, setReportRows] = useState([]);
  const [membershipForm, setMembershipForm] = useState(initialMembership);
  const [membershipDurationMonths, setMembershipDurationMonths] = useState(6);
  const [membershipDurationMode, setMembershipDurationMode] = useState("preset");
  const [membershipUpdateForm, setMembershipUpdateForm] = useState(initialMembershipUpdate);
  const [membershipExtensionMonths, setMembershipExtensionMonths] = useState(6);
  const [membershipCancel, setMembershipCancel] = useState(false);
  const [catalogForm, setCatalogForm] = useState(initialCatalog);
  const [catalogUpdateForm, setCatalogUpdateForm] = useState(initialCatalogUpdate);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    full_name: "",
    is_admin: false,
    is_active: true
  });
  const [userMode, setUserMode] = useState("new");
  const [existingUserId, setExistingUserId] = useState("");
  const [issueForm, setIssueForm] = useState({
    membership_id: 1,
    catalog_item_id: 1,
    issue_date: "",
    due_date: "",
    remarks: ""
  });
  const [returnForm, setReturnForm] = useState({ issue_id: 1, actual_return_date: "", remarks: "" });
  const [fineForm, setFineForm] = useState({ issue_id: 1, amount: 0 });
  const [finePaidChecked, setFinePaidChecked] = useState(false);

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
    const membershipsData = await api("/memberships");
    const catalogData = await api("/catalog");
    const activeIssueData = await api("/transactions/active-issues");
    setMemberships(membershipsData);
    setCatalog(catalogData);
    setActiveIssues(activeIssueData);
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
      setPendingFineIssue(null);
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

  async function updateLibraryRecord(path, form, successMessage) {
    try {
      await api(path, { method: "PUT", body: JSON.stringify(form) });
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
      const results = await api(`/catalog/search?${params.toString()}`);
      setSearchResults(results);
      setSelectedSearchItemId(null);
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

  async function submitMembership(event) {
    event.preventDefault();
    const startDate = membershipForm.start_date || new Date().toISOString().slice(0, 10);
    let computedEndDate = membershipForm.end_date;

    if (membershipDurationMode === "preset") {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + membershipDurationMonths);
      computedEndDate = endDate.toISOString().slice(0, 10);
    }

    if (!computedEndDate) {
      setMessage("End date is required");
      return;
    }

    if (computedEndDate < startDate) {
      setMessage("End date cannot be before start date");
      return;
    }

    await createLibraryRecord(
      "/memberships",
      {
        ...membershipForm,
        start_date: startDate,
        end_date: computedEndDate
      },
      () => {
        setMembershipForm(initialMembership);
        setMembershipDurationMonths(6);
        setMembershipDurationMode("preset");
      },
      "Membership created successfully"
    );
  }

  async function submitMembershipUpdate(event) {
    event.preventDefault();
    if (!membershipUpdateForm.membership_id) {
      setMessage("Membership Number is mandatory");
      return;
    }
    const currentEndDate = new Date(
      selectedMembershipForUpdate?.end_date || membershipUpdateForm.end_date || new Date()
    );
    if (!membershipCancel) {
      currentEndDate.setMonth(currentEndDate.getMonth() + membershipExtensionMonths);
    }
    await updateLibraryRecord(
      `/memberships/${membershipUpdateForm.membership_id}`,
      {
        start_date: membershipUpdateForm.start_date || undefined,
        end_date: membershipCancel
          ? membershipUpdateForm.end_date || undefined
          : currentEndDate.toISOString().slice(0, 10),
        status: membershipCancel ? "Inactive" : "Active"
      },
      "Membership updated successfully"
    );
  }

  async function submitCatalogUpdate(event) {
    event.preventDefault();
    if (!catalogUpdateForm.item_id) {
      setMessage("Book/Movie selection is mandatory");
      return;
    }
    await updateLibraryRecord(
      `/catalog/${catalogUpdateForm.item_id}`,
      {
        procurement_date: catalogUpdateForm.procurement_date || undefined,
        quantity: Number(catalogUpdateForm.quantity),
        status: catalogUpdateForm.status
      },
      "Catalog item updated successfully"
    );
  }

  async function submitIssue(event) {
    event.preventDefault();
    if (!selectedCatalogItem) {
      setMessage("Select one book from the search results to issue");
      return;
    }
    await createLibraryRecord(
      "/transactions/issue",
      {
        ...issueForm,
        catalog_item_id: selectedCatalogItem.id
      },
      () =>
        setIssueForm({
          membership_id: issueForm.membership_id,
          catalog_item_id: selectedCatalogItem.id,
          issue_date: "",
          due_date: "",
          remarks: ""
        }),
      "Transaction completed successfully"
    );
  }

  async function submitReturn(event) {
    event.preventDefault();
    if (!selectedActiveIssue) {
      setMessage("Select one issued book to return");
      return;
    }
    try {
      const response = await api("/transactions/return", {
        method: "POST",
        body: JSON.stringify(returnForm)
      });
      setPendingFineIssue(response.issue);
      setFineForm({
        issue_id: response.issue.id,
        amount: Number(response.fine_amount || 0)
      });
      setMessage(response.message);
      await loadLibrary();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function submitFine(event) {
    event.preventDefault();
    try {
      if (Number(pendingFineIssue?.fine_amount ?? 0) > 0 && !finePaidChecked) {
        setMessage("For a pending fine, the paid fine checkbox needs to be selected");
        return;
      }
      const response = await api("/transactions/pay-fine", {
        method: "POST",
        body: JSON.stringify(fineForm)
      });
      setPendingFineIssue(null);
      setFinePaidChecked(false);
      setMessage(`Fine payment recorded. Remaining: ${response.remaining_pending_amount}`);
      await loadLibrary();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadCustomerContext(code) {
    setSelectedCustomerCode(code);
    setCustomerDetail(await api(`/business/customers/${code}`));
    setLedgerRows(await api(`/business/ledger?customer_code=${code}`));
  }

  const selectedCatalogItem = catalog.find((item) => item.id === Number(selectedSearchItemId));
  const selectedMembership = memberships.find(
    (membership) => membership.id === Number(issueForm.membership_id)
  );
  const selectedMembershipForUpdate = memberships.find(
    (membership) => membership.id === Number(membershipUpdateForm.membership_id)
  );
  const selectedActiveIssue = activeIssues.find((issue) => issue.id === Number(selectedIssueId));
  const selectedReturnItem = catalog.find(
    (item) => item.id === Number(selectedActiveIssue?.catalog_item_id)
  );
  const selectedUser = users.find((entry) => entry.id === Number(existingUserId));

  useEffect(() => {
    if (!selectedMembershipForUpdate) return;
    setMembershipUpdateForm({
      membership_id: selectedMembershipForUpdate.id,
      start_date: selectedMembershipForUpdate.start_date,
      end_date: selectedMembershipForUpdate.end_date,
      status: selectedMembershipForUpdate.status
    });
    setMembershipCancel(selectedMembershipForUpdate.status !== "Active");
  }, [selectedMembershipForUpdate]);

  useEffect(() => {
    if (!selectedUser || userMode !== "existing") return;
    setUserForm({
      username: selectedUser.username,
      password: selectedUser.password ?? "",
      full_name: selectedUser.full_name,
      is_admin: selectedUser.is_admin,
      is_active: selectedUser.is_active
    });
  }, [selectedUser, userMode]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setIssueForm((current) => ({
      ...current,
      catalog_item_id: selectedCatalogItem?.id ?? current.catalog_item_id,
      issue_date: current.issue_date || today,
      due_date: current.due_date || due,
      remarks: current.remarks
    }));
  }, [selectedCatalogItem]);

  useEffect(() => {
    if (!selectedActiveIssue) return;
    setReturnForm({
      issue_id: selectedActiveIssue.id,
      actual_return_date: selectedActiveIssue.due_date,
      remarks: ""
    });
    setFineForm({
      issue_id: selectedActiveIssue.id,
      amount: Number(selectedActiveIssue.fine_amount || 0)
    });
  }, [selectedActiveIssue]);

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
                <section className="stack">
                  <DataForm title="Add Membership" fields={initialMembership} form={membershipForm} setForm={setMembershipForm} onSubmit={submitMembership} />
                  <section className="panel stack">
                    <h2>Membership Duration</h2>
                    <div className="inline-row">
                      {[6, 12, 24].map((months) => (
                        <label key={months} className="radio-row">
                          <input
                            type="radio"
                            checked={membershipDurationMode === "preset" && membershipDurationMonths === months}
                            onChange={() => {
                              setMembershipDurationMode("preset");
                              setMembershipDurationMonths(months);
                            }}
                          />
                          {months === 6 ? "6 months" : months === 12 ? "1 year" : "2 years"}
                        </label>
                      ))}
                      <label className="radio-row">
                        <input
                          type="radio"
                          checked={membershipDurationMode === "custom"}
                          onChange={() => setMembershipDurationMode("custom")}
                        />
                        Custom end date
                      </label>
                    </div>
                    <p className="subtle">
                      Default follows the workbook: 6 months selected. Use custom end date for cases like 8,7,13,etc months.
                    </p>
                  </section>
                  <section className="panel stack">
                    <h2>Update Membership</h2>
                    <label>
                      Membership Number
                      <select
                        value={membershipUpdateForm.membership_id}
                        onChange={(event) =>
                          setMembershipUpdateForm({
                            ...membershipUpdateForm,
                            membership_id: event.target.value
                          })
                        }
                        required
                      >
                        <option value="">Select membership</option>
                        {memberships.map((membership) => (
                          <option key={membership.id} value={membership.id}>
                            {membership.id}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Start date
                      <input value={membershipUpdateForm.start_date} readOnly />
                    </label>
                    <label>
                      End date
                      <input value={membershipUpdateForm.end_date} readOnly />
                    </label>
                    <div className="inline-row">
                      {[6, 12, 24].map((months) => (
                        <label key={months} className="radio-row">
                          <input
                            type="radio"
                            checked={membershipExtensionMonths === months}
                            onChange={() => setMembershipExtensionMonths(months)}
                            disabled={membershipCancel}
                          />
                          {months === 6 ? "6 months" : months === 12 ? "1 year" : "2 years"}
                        </label>
                      ))}
                    </div>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={membershipCancel}
                        onChange={(event) => setMembershipCancel(event.target.checked)}
                      />
                      Cancel membership
                    </label>
                    <button type="button" onClick={submitMembershipUpdate}>
                      Save
                    </button>
                  </section>
                </section>
                <DataPanel title="Master List of Memberships" rows={memberships} />
              </section>
            )}
            {activeSection === "Catalog" && (
              <section className="two-col">
                <section className="stack">
                  <CustomCatalogForm form={catalogForm} setForm={setCatalogForm} onSubmit={(event) => { event.preventDefault(); createLibraryRecord("/catalog", catalogForm, () => setCatalogForm(initialCatalog), "Catalog item created successfully"); }} />
                  <section className="panel grid">
                    <h2>Update Book / Movie</h2>
                    <label>
                      Type
                      <select
                        value={catalogUpdateForm.item_type}
                        onChange={(event) =>
                          setCatalogUpdateForm({
                            ...catalogUpdateForm,
                            item_type: event.target.value,
                            item_id: ""
                          })
                        }
                      >
                        <option>Book</option>
                        <option>Movie</option>
                      </select>
                    </label>
                    <label>
                      Book / Movie
                      <select
                        value={catalogUpdateForm.item_id}
                        onChange={(event) => {
                          const item = catalog.find((entry) => entry.id === Number(event.target.value));
                          setCatalogUpdateForm({
                            ...catalogUpdateForm,
                            item_id: event.target.value,
                            procurement_date: item?.procurement_date ?? "",
                            quantity: item?.quantity ?? 1,
                            status: item?.status ?? "Available"
                          });
                        }}
                        required
                      >
                        <option value="">Select item</option>
                        {catalog
                          .filter((entry) => entry.item_type === catalogUpdateForm.item_type)
                          .map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.title}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      Procurement date
                      <input
                        type="date"
                        value={catalogUpdateForm.procurement_date}
                        onChange={(event) =>
                          setCatalogUpdateForm({
                            ...catalogUpdateForm,
                            procurement_date: event.target.value
                          })
                        }
                        required
                      />
                    </label>
                    <label>
                      Quantity
                      <input
                        type="number"
                        min="1"
                        value={catalogUpdateForm.quantity}
                        onChange={(event) =>
                          setCatalogUpdateForm({
                            ...catalogUpdateForm,
                            quantity: Number(event.target.value)
                          })
                        }
                        required
                      />
                    </label>
                    <label>
                      Status
                      <select
                        value={catalogUpdateForm.status}
                        onChange={(event) =>
                          setCatalogUpdateForm({
                            ...catalogUpdateForm,
                            status: event.target.value
                          })
                        }
                        required
                      >
                        <option>Available</option>
                        <option>Unavailable</option>
                      </select>
                    </label>
                    <button type="button" onClick={submitCatalogUpdate}>
                      Save
                    </button>
                  </section>
                </section>
                <DataPanel title="Master List of Books and Movies" rows={catalog} />
              </section>
            )}
            {activeSection === "Users" && user.role === "admin" && (
              <section className="two-col">
                <UserForm
                  form={userForm}
                  setForm={setUserForm}
                  userMode={userMode}
                  setUserMode={setUserMode}
                  existingUserId={existingUserId}
                  setExistingUserId={setExistingUserId}
                  users={users}
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (userMode === "new") {
                      await createLibraryRecord("/users", userForm, () => setUserForm({ username: "", password: "", full_name: "", is_admin: false, is_active: true }), "User created successfully");
                    } else if (existingUserId) {
                      await updateLibraryRecord(
                        `/users/${existingUserId}`,
                        {
                          full_name: userForm.full_name,
                          is_admin: userForm.is_admin,
                          is_active: userForm.is_active
                        },
                        "User updated successfully"
                      );
                    } else {
                      setMessage("Select an existing user");
                    }
                  }}
                />
                <DataPanel title="Users" rows={users} />
              </section>
            )}
            {activeSection === "Transactions" && (
              <section className="stack">
                <SearchForm search={search} setSearch={setSearch} onSubmit={searchCatalog} />
                <SearchResultsPanel rows={searchResults} selectedId={selectedSearchItemId} onSelect={setSelectedSearchItemId} />
                <div className="three-col">
                  <IssueForm form={issueForm} setForm={setIssueForm} selectedItem={selectedCatalogItem} selectedMembership={selectedMembership} onSubmit={submitIssue} />
                  <ReturnForm form={returnForm} setForm={setReturnForm} activeIssues={activeIssues} selectedIssueId={selectedIssueId} setSelectedIssueId={setSelectedIssueId} selectedItem={selectedReturnItem} onSubmit={submitReturn} />
                  <FineForm form={fineForm} setForm={setFineForm} pendingFineIssue={pendingFineIssue} selectedItem={selectedReturnItem} finePaidChecked={finePaidChecked} setFinePaidChecked={setFinePaidChecked} onSubmit={submitFine} />
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
                <ExpenseForm form={expenseForm} setForm={setExpenseForm} onSubmit={(event) => { event.preventDefault(); createBusinessRecord("/business/expenses", expenseForm, () => setExpenseForm({ entry_date: "", customer_code: "DR-AP-0001", customer_name: "", journey_km: 0, ta_amount: 0, conveyance_amount: 0, da_amount: 0, telephone_amount: 0, repair_amount: 0, other_amount: 0, senior_approval: "no" }), "Expense entry created successfully"); }} />
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

function UserForm({
  form,
  setForm,
  userMode,
  setUserMode,
  existingUserId,
  setExistingUserId,
  users,
  onSubmit
}) {
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>User Management</h2>
      <div className="inline-row">
        <label className="radio-row">
          <input
            type="radio"
            checked={userMode === "new"}
            onChange={() => {
              setUserMode("new");
              setExistingUserId("");
              setForm({
                username: "",
                password: "",
                full_name: "",
                is_admin: false,
                is_active: true
              });
            }}
          />
          New user
        </label>
        <label className="radio-row">
          <input
            type="radio"
            checked={userMode === "existing"}
            onChange={() => setUserMode("existing")}
          />
          Existing user
        </label>
      </div>
      {userMode === "existing" && (
        <label>
          Existing user
          <select value={existingUserId} onChange={(event) => setExistingUserId(event.target.value)} required>
            <option value="">Select user</option>
            {users.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.username}
              </option>
            ))}
          </select>
        </label>
      )}
      {["username", "password", "full_name"].map((key) => (
        <label key={key}>
          {key.replaceAll("_", " ")}
          <input
            type={key === "password" ? "password" : "text"}
            value={form[key]}
            onChange={(event) => setForm({ ...form, [key]: event.target.value })}
            required={key === "full_name" || userMode === "new"}
            readOnly={userMode === "existing" && key === "username"}
          />
        </label>
      ))}
      <label className="check-row"><input type="checkbox" checked={form.is_admin} onChange={(event) => setForm({ ...form, is_admin: event.target.checked })} />Admin</label>
      <label className="check-row"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Active</label>
      <button type="submit">Save User</button>
    </form>
  );
}

function ExpenseForm({ form, setForm, onSubmit }) {
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>T.A D.A</h2>
      {[
        "entry_date",
        "customer_code",
        "customer_name",
        "journey_km",
        "ta_amount",
        "conveyance_amount",
        "da_amount",
        "telephone_amount",
        "repair_amount",
        "other_amount"
      ].map((key) => (
        <label key={key}>
          {key.replaceAll("_", " ")}
          <input
            type={key.includes("date") ? "date" : typeof form[key] === "number" ? "number" : "text"}
            value={form[key]}
            onChange={(event) =>
              setForm({
                ...form,
                [key]: typeof form[key] === "number" ? Number(event.target.value) : event.target.value
              })
            }
            required
          />
        </label>
      ))}
      <label className="check-row">
        <input
          type="checkbox"
          checked={form.senior_approval === "yes"}
          onChange={(event) =>
            setForm({
              ...form,
              senior_approval: event.target.checked ? "yes" : "no"
            })
          }
        />
        Senior Approval
      </label>
      <p className="subtle">
        Checkbox rule: checked means yes, unchecked means no.
      </p>
      <button type="submit">Save</button>
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

function SearchResultsPanel({ rows, selectedId, onSelect }) {
  return (
    <section className="panel">
      <h2>Search Results</h2>
      {!rows?.length ? (
        <p className="subtle">No records found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Book Name</th>
                <th>Author</th>
                <th>Available</th>
                <th>Select to issue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.author_or_creator}</td>
                  <td>{row.quantity > 0 ? "Y" : "N"}</td>
                  <td>
                    <input
                      type="radio"
                      name="issue-book"
                      checked={selectedId === row.id}
                      onChange={() => onSelect(row.id)}
                      disabled={row.quantity <= 0}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function IssueForm({ form, setForm, selectedItem, selectedMembership, onSubmit }) {
  const maxReturnDate = form.issue_date
    ? new Date(new Date(form.issue_date).getTime() + 15 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : "";
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>Issue Book</h2>
      <NumberField label="Membership ID" value={form.membership_id} onChange={(value) => setForm({ ...form, membership_id: value })} />
      <label>
        Name of book
        <input value={selectedItem?.title ?? ""} readOnly required />
      </label>
      <label>
        Author name
        <input value={selectedItem?.author_or_creator ?? ""} readOnly />
      </label>
      <DateField label="Issue Date" min={new Date().toISOString().slice(0, 10)} value={form.issue_date} onChange={(value) => setForm({ ...form, issue_date: value })} />
      <DateField label="Return Date" min={form.issue_date} max={maxReturnDate} value={form.due_date} onChange={(value) => setForm({ ...form, due_date: value })} />
      <label>Remarks<textarea value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} /></label>
      {selectedMembership && <p className="subtle">Membership status: {selectedMembership.status}</p>}
      <button type="submit">Issue</button>
    </form>
  );
}

function ReturnForm({ form, setForm, activeIssues, selectedIssueId, setSelectedIssueId, selectedItem, onSubmit }) {
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>Return Book</h2>
      <label>
        Serial No of the book
        <select value={selectedIssueId} onChange={(event) => setSelectedIssueId(event.target.value)} required>
          <option value="">Select issued book</option>
          {activeIssues.map((issue) => (
            <option key={issue.id} value={issue.id}>
              {issue.id}
            </option>
          ))}
        </select>
      </label>
      <label>
        Name of Book
        <input value={selectedItem?.title ?? ""} readOnly required />
      </label>
      <label>
        Author name
        <input value={selectedItem?.author_or_creator ?? ""} readOnly />
      </label>
      <label>
        Issue Date
        <input value={selectedIssueId ? activeIssues.find((issue) => issue.id === Number(selectedIssueId))?.issue_date ?? "" : ""} readOnly />
      </label>
      <DateField label="Return Date" value={form.actual_return_date} onChange={(value) => setForm({ ...form, actual_return_date: value })} />
      <label>Remarks<textarea value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} /></label>
      <button type="submit">Confirm Return</button>
    </form>
  );
}

function FineForm({
  form,
  setForm,
  pendingFineIssue,
  selectedItem,
  finePaidChecked,
  setFinePaidChecked,
  onSubmit
}) {
  return (
    <form className="panel grid" onSubmit={onSubmit}>
      <h2>Pay Fine</h2>
      <label>
        Issue ID
        <input value={form.issue_id} readOnly />
      </label>
      <label>
        Name of Book
        <input value={selectedItem?.title ?? ""} readOnly />
      </label>
      <label>
        Fine Calculated
        <input value={pendingFineIssue?.fine_amount ?? form.amount ?? 0} readOnly />
      </label>
      <NumberField label="Fine Paid" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} />
      <label className="check-row">
        <input
          type="checkbox"
          checked={finePaidChecked}
          onChange={(event) => setFinePaidChecked(event.target.checked)}
        />
        Fine Paid
      </label>
      <label>Remarks<textarea defaultValue="" placeholder="Optional remarks" /></label>
      <button type="submit">{Number(pendingFineIssue?.fine_amount ?? 0) > 0 ? "Pay Fine" : "Confirm"}</button>
    </form>
  );
}

function NumberField({ label, value, onChange }) {
  return <label>{label}<input type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} required /></label>;
}

function DateField({ label, value, onChange, min, max }) {
  return <label>{label}<input type="date" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} required /></label>;
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
