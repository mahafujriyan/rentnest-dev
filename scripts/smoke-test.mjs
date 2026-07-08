const BASE = "http://localhost:5000";
const log = (...a) => console.log(...a);
let tenantToken = "";
let landlordToken = "";
let adminToken = "";
let propertyId = "";
let rentalId = "";

async function call(method, path, body, token) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let json;
  try { json = await res.json(); } catch { json = { raw: await res.text() }; }
  return { status: res.status, json };
}

(async () => {
  // 1. Health
  const h = await call("GET", "/health");
  log("1. HEALTH:", h.status, h.json.success);

  // 2. Logins
  const la = await call("POST", "/api/auth/login", { email: "admin@rentnest.com", password: "admin123" });
  adminToken = la.json.data?.accessToken || "";
  log("2. ADMIN LOGIN:", la.status, la.json.success);

  const ll = await call("POST", "/api/auth/login", { email: "landlord1@rentnest.com", password: "Landlord123!" });
  landlordToken = ll.json.data?.accessToken || "";
  log("3. LANDLORD LOGIN:", ll.status, ll.json.success);

  const lt = await call("POST", "/api/auth/login", { email: "tenant5@rentnest.com", password: "Tenant123!" });
  tenantToken = lt.json.data?.accessToken || "";
  log("4. TENANT LOGIN:", lt.status, lt.json.success);

  // 3. Auth me
  const me = await call("GET", "/api/auth/me", null, tenantToken);
  log("5. AUTH ME:", me.status, me.json.data?.role);

  // 4. Public listings
  const props = await call("GET", "/api/properties?limit=3&sortBy=price&sortOrder=asc");
  propertyId = props.json.data?.[0]?.id || "";
  log("6. PROPERTIES:", props.status, "count", props.json.data?.length, "total", props.json.meta?.total);

  const cats = await call("GET", "/api/categories");
  log("7. CATEGORIES:", cats.status, "count", cats.json.data?.length);

  const single = await call("GET", "/api/properties/" + propertyId);
  log("8. PROPERTY DETAIL:", single.status, single.json.success);

  // 5. Validation error test
  const badLogin = await call("POST", "/api/auth/login", { email: "not-an-email" });
  log("9. VALIDATION ERROR:", badLogin.status, badLogin.json.success, "->", badLogin.json.message);

  // 6. 404 test
  const notFound = await call("GET", "/api/does-not-exist");
  log("10. 404 TEST:", notFound.status, notFound.json.message);

  // 7. Unauthorized test
  const noAuth = await call("GET", "/api/auth/me");
  log("11. UNAUTHORIZED:", noAuth.status, noAuth.json.message);

  // 8. Tenant creates rental request
  const rental = await call("POST", "/api/rentals", {
    propertyId,
    moveInDate: "2026-09-01",
    message: "Full flow test"
  }, tenantToken);
  rentalId = rental.json.data?.id || "";
  log("12. CREATE RENTAL:", rental.status, rental.json.success, rental.json.message);

  // 9. Landlord approves (need the landlord that owns this property)
  const propOwnerId = single.json.data?.landlordId;
  // find which landlord owns it by logging in each? Simpler: admin lists, but approval must be owner.
  // Try landlord1 first; if forbidden, we report.
  let approve = await call("PATCH", "/api/landlord/requests/" + rentalId, { status: "APPROVED" }, landlordToken);
  log("13. APPROVE (landlord1):", approve.status, approve.json.message);

  // 10. Admin dashboard
  const dash = await call("GET", "/api/admin/dashboard", null, adminToken);
  log("14. ADMIN DASHBOARD:", dash.status, JSON.stringify(dash.json.data));

  // 11. Admin users
  const users = await call("GET", "/api/admin/users", null, adminToken);
  log("15. ADMIN USERS:", users.status, "count", users.json.data?.length);

  // 12. Role guard: tenant tries admin
  const guard = await call("GET", "/api/admin/users", null, tenantToken);
  log("16. ROLE GUARD (tenant->admin):", guard.status, guard.json.message);

  log("\\nALL CORE TESTS DONE");
})();
