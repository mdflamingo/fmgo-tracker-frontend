import type { Project } from '../types/project'
import type { TaskListResponse } from '../types/task'

interface ProjectSidebarProps {
  projects: Project[]
  tasks: TaskListResponse[]
  activeProjectId: string | null
  onSelect: (projectId: string | null) => void
}

export function ProjectSidebar({
  projects,
  tasks,
  activeProjectId,
  onSelect,
}: ProjectSidebarProps) {
  const countFor = (projectId: string) => tasks.filter((t) => t.project_id === projectId).length

  return (
    <aside className="sidebar">
      <div className="sidebar__title">Projects</div>
      <div className="sidebar__list">
        <button
          type="button"
          className={activeProjectId === null ? 'sidebar__item sidebar__item--active' : 'sidebar__item'}
          onClick={() => onSelect(null)}
        >
          <span className="sidebar__item-name">All projects</span>
          <span className="sidebar__item-count">{tasks.length}</span>
        </button>

        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            className={
              activeProjectId === project.id
                ? 'sidebar__item sidebar__item--active'
                : 'sidebar__item'
            }
            onClick={() => onSelect(project.id)}
          >
            <span className="sidebar__item-name">{project.name}</span>
            <span className="sidebar__item-count">{countFor(project.id)}</span>
          </button>
        ))}

        {projects.length === 0 && <div className="sidebar__empty">No projects yet</div>}
      </div>
    </aside>
  )
}