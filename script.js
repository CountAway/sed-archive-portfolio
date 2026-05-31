/* ==============================================
   SED_ARCHIVE — Portfolio JavaScript
   Pure vanilla JS, no dependencies
   Scroll-based single page layout
   ============================================== */

(function () {
  'use strict';

  /* ------------------------------------------
     PROJECT DATA (organized by era)
     ------------------------------------------ */
  const PROJECTS_BY_ERA = {
    'cenozoic': {
      chinese: '新生代',
      english: 'CENOZOIC',
      projects: [
        {
          id: 'SED-2024-001',
          title: 'Synthesis Platform',
          date: '2024.01 — PRESENT',
          category: 'PLATFORM',
          description: 'An ongoing initiative to develop a unified digital platform for the synthesis and presentation of all prior research outputs. The platform integrates the visualization prototype, computational analysis tool, and field documentation archive into a single, searchable interface designed around the geological stratigraphy metaphor.'
        },
        {
          id: 'SED-2024-002',
          title: 'Cross-Disciplinary Survey',
          date: '2024.03 — 2024.08',
          category: 'SURVEY',
          description: 'A collaborative survey conducted with researchers from three allied disciplines — architecture, materials science, and information design. The project mapped the methodological commonalities and divergences in how each field approaches the classification and representation of layered systems.'
        },
        {
          id: 'SED-2024-003',
          title: 'Applied Lithification',
          date: '2024.09 — PRESENT',
          category: 'RESEARCH',
          description: 'The capstone research project of the current phase, investigating the practical applications of lithification principles in digital design practice.'
        }
      ]
    },
    'mesozoic': {
      chinese: '中生代',
      english: 'MESOZOIC',
      projects: [
        {
          id: 'SED-2022-001',
          title: 'Urban Texture Mapping',
          date: '2022.01 — 2022.06',
          category: 'FIELDWORK',
          description: 'A systematic survey of architectural surface textures across six metropolitan districts. Employed a standardized documentation protocol to capture and classify the visible stratification of urban facades.'
        },
        {
          id: 'SED-2022-002',
          title: 'Computational Analysis Tool',
          date: '2022.07 — 2022.12',
          category: 'TOOL',
          description: 'Design and implementation of a computational pipeline for automated texture classification. The tool processes photographic samples, extracts feature vectors, and assigns each sample to a category within a geological analogue taxonomy.'
        },
        {
          id: 'SED-2023-001',
          title: 'Material Study II',
          date: '2023.01 — 2023.05',
          category: 'STUDY',
          description: 'Continuation of the material investigation series, expanding the scope to include metamorphic and igneous analogues.'
        },
        {
          id: 'SED-2023-002',
          title: 'Field Documentation',
          date: '2023.06 — 2023.11',
          category: 'DOCUMENTATION',
          description: 'Comprehensive field documentation campaign covering three distinct geological sites. The archive includes over 2,000 catalogued specimens with full metadata.'
        }
      ]
    },
    'paleozoic': {
      chinese: '古生代',
      english: 'PALEOZOIC',
      projects: [
        {
          id: 'SED-2020-001',
          title: 'Foundation Research',
          date: '2020.03 — 2020.09',
          category: 'RESEARCH',
          description: 'An exploratory investigation into the foundational principles of visual data encoding. This project established the methodological framework that would inform subsequent studies.'
        },
        {
          id: 'SED-2020-002',
          title: 'Data Visualization Prototype',
          date: '2020.11 — 2021.02',
          category: 'PROTOTYPE',
          description: 'Development of an interactive visualization tool for representing multi-dimensional datasets in two-dimensional space.'
        },
        {
          id: 'SED-2021-001',
          title: 'Material Study I',
          date: '2021.04 — 2021.08',
          category: 'STUDY',
          description: 'First in a series of material investigations examining the physical properties and visual characteristics of sedimentary analogues.'
        }
      ]
    }
  };

  // Legacy format for modal lookup
  const PROJECTS = {
    '01': PROJECTS_BY_ERA.paleozoic.projects,
    '02': PROJECTS_BY_ERA.mesozoic.projects,
    '03': PROJECTS_BY_ERA.cenozoic.projects
  };

  // Map project ID to era key
  const PROJECT_ID_TO_ERA = {};
  Object.keys(PROJECTS_BY_ERA).forEach(era => {
    PROJECTS_BY_ERA[era].projects.forEach(p => {
      PROJECT_ID_TO_ERA[p.id] = era;
    });
  });

  /* ------------------------------------------
     DOM REFERENCES
     ------------------------------------------ */
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingBarFill = document.getElementById('loadingBarFill');
  const navBar = document.getElementById('navBar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalSpecimenId = document.getElementById('modalSpecimenId');
  const modalTitle = document.getElementById('modalTitle');
  const modalMeta = document.getElementById('modalMeta');
  const modalDescription = document.getElementById('modalDescription');
  const modalTags = document.getElementById('modalTags');

  // Archive/Portfolio elements
  const eraBlocks = document.querySelectorAll('.era-block');
  const projectPanel = document.getElementById('archiveProjectPanel');
  const projectPanelEra = document.getElementById('projectPanelEra');
  const projectPanelCount = document.getElementById('projectPanelCount');
  const projectPanelList = document.getElementById('projectPanelList');

  /* ------------------------------------------
     LOADING SCREEN
     ------------------------------------------ */
  function initLoading() {
    requestAnimationFrame(() => {
      loadingBarFill.classList.add('animate');
    });

    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      navBar.classList.add('visible');
    }, 1800);
  }

  /* ------------------------------------------
     ARCHIVE / PORTFOLIO INTERACTIONS
     ------------------------------------------ */
  function initArchiveInteractions() {
    let currentActiveEra = null;
    let currentActiveCategory = null;

    eraBlocks.forEach(block => {
      block.addEventListener('mouseenter', function () {
        const era = this.dataset.era;
        if (era === currentActiveEra) return;

        currentActiveEra = era;
        showProjectPanel(era);

        // Update active state
        eraBlocks.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });

      block.addEventListener('click', function () {
        const era = this.dataset.era;
        currentActiveEra = era;
        showProjectPanel(era);

        eraBlocks.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // Close panel when mouse leaves the archive section
    const archiveSection = document.getElementById('sectionArchive');
    if (archiveSection) {
      archiveSection.addEventListener('mouseleave', function () {
        hideProjectPanel();
        eraBlocks.forEach(b => b.classList.remove('active'));
        currentActiveEra = null;
      });
    }

    // Legend click handlers
    const legendItems = document.querySelectorAll('.legend-item');
    const legendFilterPanel = document.getElementById('legendFilterPanel');
    const legendFilterCategory = document.getElementById('legendFilterCategory');
    const legendFilterCount = document.getElementById('legendFilterCount');
    const legendFilterList = document.getElementById('legendFilterList');

    legendItems.forEach(item => {
      item.addEventListener('click', function () {
        const category = this.dataset.category;
        
        // Toggle active state
        if (currentActiveCategory === category) {
          // Close if already active
          legendFilterPanel.classList.remove('visible');
          legendItems.forEach(i => i.classList.remove('active'));
          currentActiveCategory = null;
          return;
        }

        currentActiveCategory = category;
        
        // Update active state
        legendItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');

        // Show filtered projects
        showLegendFilterPanel(category);
      });
    });

    // Close legend filter panel when clicking outside
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.archive-legend') && !e.target.closest('.legend-filter-panel')) {
        legendFilterPanel.classList.remove('visible');
        legendItems.forEach(i => i.classList.remove('active'));
        currentActiveCategory = null;
      }
    });
  }

  function showLegendFilterPanel(category) {
    const legendFilterPanel = document.getElementById('legendFilterPanel');
    const legendFilterCategory = document.getElementById('legendFilterCategory');
    const legendFilterCount = document.getElementById('legendFilterCount');
    const legendFilterList = document.getElementById('legendFilterList');

    // Collect all projects with this category
    let filteredProjects = [];
    Object.keys(PROJECTS_BY_ERA).forEach(era => {
      PROJECTS_BY_ERA[era].projects.forEach(project => {
        if (project.category === category) {
          filteredProjects.push({
            ...project,
            era: PROJECTS_BY_ERA[era].chinese + ' ' + PROJECTS_BY_ERA[era].english
          });
        }
      });
    });

    // Update header
    legendFilterCategory.textContent = category;
    legendFilterCategory.style.color = getCategoryColor(category);
    legendFilterCount.textContent = filteredProjects.length + ' PROJECTS';

    // Build list
    let html = '';
    filteredProjects.forEach(project => {
      html += `
        <div class="project-item" data-project-id="${project.id}">
          <span class="project-item-id">${project.id}</span>
          <span class="project-item-title">${project.title}</span>
          <div class="project-item-meta">
            <span class="project-item-date">${project.date}</span>
            <span class="project-item-category" data-category="${project.category}">${project.era}</span>
          </div>
        </div>
      `;
    });
    legendFilterList.innerHTML = html;

    // Attach click events
    legendFilterList.querySelectorAll('.project-item').forEach(item => {
      item.addEventListener('click', function () {
        const projectId = this.dataset.projectId;
        // Find the era for this project
        let era = null;
        Object.keys(PROJECTS_BY_ERA).forEach(e => {
          if (PROJECTS_BY_ERA[e].projects.find(p => p.id === projectId)) {
            era = e;
          }
        });
        if (era) {
          openProjectModal(projectId, era);
        }
      });
    });

    // Show panel
    legendFilterPanel.classList.add('visible');
  }

  function getCategoryColor(category) {
    const colors = {
      'RESEARCH': 'var(--color-accent)',
      'PLATFORM': 'var(--color-slate)',
      'FIELDWORK': 'var(--color-mist)',
      'STUDY': '#8B7355',
      'TOOL': '#6B8E6B'
    };
    return colors[category] || 'var(--color-text)';
  }

  function showProjectPanel(era) {
    const eraData = PROJECTS_BY_ERA[era];
    if (!eraData) return;

    // Update header
    projectPanelEra.textContent = eraData.chinese + ' ' + eraData.english;
    projectPanelCount.textContent = eraData.projects.length + ' SPECIMENS';

    // Build project list with colored tags
    let html = '';
    eraData.projects.forEach(project => {
      html += `
        <div class="project-item" data-project-id="${project.id}" data-era="${era}">
          <span class="project-item-id">${project.id}</span>
          <span class="project-item-title">${project.title}</span>
          <div class="project-item-meta">
            <span class="project-item-date">${project.date}</span>
            <span class="project-item-category" data-category="${project.category}">${project.category}</span>
          </div>
        </div>
      `;
    });
    projectPanelList.innerHTML = html;

    // Attach click events
    projectPanelList.querySelectorAll('.project-item').forEach(item => {
      item.addEventListener('click', function () {
        const projectId = this.dataset.projectId;
        const era = this.dataset.era;
        openProjectModal(projectId, era);
      });
    });

    // Show panel
    projectPanel.classList.add('visible');
  }

  function hideProjectPanel() {
    projectPanel.classList.remove('visible');
  }

  /* ------------------------------------------
     NAVIGATION - Smooth Scroll
     ------------------------------------------ */
  function navigateTo(targetSection) {
    const targetEl = document.getElementById('section' + capitalize(targetSection));
    if (!targetEl) return;

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === targetSection);
    });

    const navHeight = navBar.offsetHeight;
    const targetPosition = targetEl.offsetTop - navHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ------------------------------------------
     SCROLL SPY - Update active nav on scroll
     ------------------------------------------ */
  function initScrollSpy() {
    const navHeight = navBar.offsetHeight;

    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY + navHeight + 100;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.id.replace('section', '').toLowerCase();

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
          });
        }
      });
    });
  }

  /* ------------------------------------------
     PROJECT MODAL
     ------------------------------------------ */
  function openProjectModal(projectId, era) {
    const eraData = PROJECTS_BY_ERA[era];
    if (!eraData) return;

    const project = eraData.projects.find(p => p.id === projectId);
    if (!project) return;

    // Populate modal content
    modalSpecimenId.textContent = project.id;
    modalTitle.textContent = project.title;
    modalMeta.innerHTML = `
      <div class="modal-meta-item">
        <span class="modal-meta-item-label">DATE</span>
        <span class="modal-meta-item-value">${project.date}</span>
      </div>
      <div class="modal-meta-item">
        <span class="modal-meta-item-label">CATEGORY</span>
        <span class="modal-meta-item-value">${project.category}</span>
      </div>
      <div class="modal-meta-item">
        <span class="modal-meta-item-label">ERA</span>
        <span class="modal-meta-item-value">${eraData.chinese} / ${eraData.english}</span>
      </div>
    `;
    modalDescription.textContent = project.description;
    modalTags.innerHTML = `
      <span class="tag">${project.category}</span>
      <span class="tag">${eraData.english}</span>
      <span class="tag">${project.date.split(' ')[0].split('.')[0]}</span>
    `;

    // Show modal
    modalOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    modalOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  /* ------------------------------------------
     EVENT LISTENERS
     ------------------------------------------ */
  function initEventListeners() {
    // Navigation clicks - smooth scroll
    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.dataset.section;
        navigateTo(target);
      });
    });

    // Logo click -> scroll to About
    document.querySelector('.nav-logo').addEventListener('click', function (e) {
      e.preventDefault();
      navigateTo('about');
    });

    // Modal close
    modalClose.addEventListener('click', closeProjectModal);

    // Modal overlay click to close
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) {
        closeProjectModal();
      }
    });

    // Escape key to close modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalOverlay.classList.contains('visible')) {
        closeProjectModal();
      }
    });

    // Connect button
    document.querySelector('.nav-connect-btn').addEventListener('click', function (e) {
      e.preventDefault();
      alert('Contact functionality would be implemented here.');
    });

    // Blog "Read more" links
    document.querySelectorAll('.blog-read-more').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
      });
    });

    // Experience entries - clickable
    document.querySelectorAll('.timeline-entry').forEach(entry => {
      entry.addEventListener('click', function () {
        const role = this.querySelector('.timeline-role').textContent;
        const org = this.querySelector('.timeline-org').textContent;
        const date = this.querySelector('.timeline-date').textContent;
        const desc = this.querySelector('.timeline-desc').textContent.trim();
        const tags = Array.from(this.querySelectorAll('.tag')).map(t => t.textContent);

        openDetailModal({
          id: this.dataset.entryId,
          title: role,
          subtitle: org,
          date: date,
          category: 'EXPERIENCE',
          description: desc,
          tags: tags
        });
      });
    });

    // Blog entries - clickable
    document.querySelectorAll('.blog-entry').forEach(entry => {
      entry.addEventListener('click', function () {
        const title = this.querySelector('.blog-entry-title').textContent;
        const date = this.querySelector('.blog-date').textContent;
        const category = this.querySelector('.blog-category').textContent;
        const excerpt = this.querySelector('.blog-entry-excerpt').textContent.trim();

        openDetailModal({
          id: this.dataset.entryId,
          title: title,
          subtitle: 'Research Note',
          date: date,
          category: category,
          description: excerpt,
          tags: [category, 'WRITING']
        });
      });
    });
  }

  /* ------------------------------------------
     DETAIL MODAL (for Experience/Blog)
     ------------------------------------------ */
  function openDetailModal(data) {
    modalSpecimenId.textContent = data.id.toUpperCase();
    modalTitle.textContent = data.title;
    modalMeta.innerHTML = `
      <div class="modal-meta-item">
        <span class="modal-meta-item-label">DATE</span>
        <span class="modal-meta-item-value">${data.date}</span>
      </div>
      <div class="modal-meta-item">
        <span class="modal-meta-item-label">CATEGORY</span>
        <span class="modal-meta-item-value">${data.category}</span>
      </div>
      ${data.subtitle ? `
      <div class="modal-meta-item">
        <span class="modal-meta-item-label">CONTEXT</span>
        <span class="modal-meta-item-value">${data.subtitle}</span>
      </div>
      ` : ''}
    `;
    modalDescription.textContent = data.description;
    modalTags.innerHTML = data.tags.map(t => `<span class="tag">${t}</span>`).join('');

    modalOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  /* ------------------------------------------
     INITIALIZATION
     ------------------------------------------ */
  function init() {
    initArchiveInteractions();
    initEventListeners();
    initScrollSpy();
    initLoading();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
