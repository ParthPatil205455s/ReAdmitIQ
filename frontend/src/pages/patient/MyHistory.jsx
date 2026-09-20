import PageHeader from '../../components/shared/PageHeader';
import Timeline from '../../components/shared/Timeline';
import Card from '../../components/ui/Card';
import { medicalHistory } from '../../data/mockData';

export default function MyHistory() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Health Journey & Records"
        subtitle="Chronological record of your hospital visits, discharge instructions, and follow-up care"
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient/dashboard' },
          { label: 'Medical History' },
        ]}
      />

      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
          Hospitalization Timeline & Care Notes
        </h3>
        <Timeline events={medicalHistory} />
      </Card>
    </div>
  );
}
