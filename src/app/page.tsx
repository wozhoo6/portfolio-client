import { Landing } from '@/components/Landing'
import { loadProjects } from '@/lib/server-projects'

export default async function Home() {
  const { projects, failed } = await loadProjects()
  return <Landing projects={projects} loadFailed={failed} />
}
