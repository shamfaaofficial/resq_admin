(() => {
  const body = document.body;
  const sidebar = document.getElementById("dashboardSidebar");
  const backdrop = document.querySelector("[data-sidebar-backdrop]");
  const toggles = document.querySelectorAll("[data-sidebar-toggle]");

  if (!sidebar || !toggles.length) {
    return;
  }

  const closeSidebar = () => {
    body.classList.remove("sidebar-open");
    body.style.removeProperty("overflow");
  };

  const openSidebar = () => {
    body.classList.add("sidebar-open");
    body.style.setProperty("overflow", "hidden");
  };

  const toggleSidebar = () => {
    if (body.classList.contains("sidebar-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  toggles.forEach((button) => {
    button.addEventListener("click", toggleSidebar);
  });

  if (backdrop) {
    backdrop.addEventListener("click", closeSidebar);
  }

  sidebar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      closeSidebar();
    }
  });
})();
