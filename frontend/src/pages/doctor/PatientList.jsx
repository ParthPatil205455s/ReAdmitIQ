import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  UserPlus,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Activity,
  Heart,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import RiskBadge from '../../components/shared/RiskBadge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import AddPatientModal from '../../components/modals/AddPatientModal';
import { fetchPatients } from '../../api/endpoints';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const pageSize = 8;

  const loadPatients = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchPatients();
      setPatients(data || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handlePatientCreated = (newPatient) => {
    loadPatients(true);
  };

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const nameMatch = (p.name || p.full_name || '').toLowerCase().includes(search.toLowerCase());
      const mrnMatch = (p.mrn || '').toLowerCase().includes(search.toLowerCase());
      const condMatch = (p.primaryDiagnosis || p.condition || p.primary_condition || '')
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesSearch = nameMatch || mrnMatch || condMatch;
      const matchesRisk =
        riskFilter === 'all' || p.riskLevel?.toLowerCase() === riskFilter.toLowerCase();

      return matchesSearch && matchesRisk;
    });
  }, [patients, search, riskFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Worklist Directory"
        subtitle="Active inpatients and recent discharges flagged for 30-day readmission risk"
        breadcrumbs={[
          { label: 'Doctor Portal', href: '/doctor/dashboard' },
          { label: 'Patients' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadPatients(true)}
              loading={refreshing}
              className="gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-1.5 shadow-md shadow-brand/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Patient</span>
            </Button>
          </div>
        }
      />

      {/* Filters Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, MRN, condition..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'critical', 'high', 'medium', 'low'].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setRiskFilter(level);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  riskFilter === level
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Patient / MRN</th>
                <th className="py-3 px-4 font-semibold">Demographics</th>
                <th className="py-3 px-4 font-semibold">Primary Condition</th>
                <th className="py-3 px-4 font-semibold">Risk Stratification</th>
                <th className="py-3 px-4 font-semibold">Readmission Probability</th>
                <th className="py-3 px-4 font-semibold">Admission / LOS</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading patient worklist...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No patients found matching your search criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {patient.name || patient.full_name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {patient.mrn}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {patient.age} yrs · {patient.gender}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {patient.primaryDiagnosis || patient.condition || patient.primary_condition}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={patient.riskLevel || 'low'} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{Math.round((patient.riskScore || 0.15) * 100)}%</span>
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (patient.riskScore || 0.15) > 0.6
                                ? 'bg-red-500'
                                : (patient.riskScore || 0.15) > 0.3
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.round((patient.riskScore || 0.15) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {patient.admissionDate || '2026-09-15'} ({patient.lengthOfStay || patient.length_of_stay || 3}d LOS)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/doctor/predictions/${patient.id}`}>
                          <Button variant="primary" size="sm" className="text-xs py-1 px-2.5">
                            AI Rationale
                          </Button>
                        </Link>
                        <Link to={`/doctor/patients/${patient.id}`}>
                          <Button variant="secondary" size="sm" className="text-xs py-1 px-2">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filtered.length)} of {filtered.length} patients
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      {/* Add New Patient Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPatientCreated={handlePatientCreated}
      />
    </div>
  );
}
