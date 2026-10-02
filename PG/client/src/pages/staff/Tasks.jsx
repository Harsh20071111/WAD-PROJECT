import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const Tasks = () => <><PageHeader eyebrow="Staff workspace" title="My tasks" description="Assigned service requests will appear here." /><EmptyState icon="assignment" title="No tasks yet" description="Your assigned maintenance work will be listed here." /></>;
export default Tasks;
