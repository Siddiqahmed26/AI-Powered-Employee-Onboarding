import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Building2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const departments = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Customer Support',
  'Legal',
];

const rolesByDepartment: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'QA Engineer', 'Tech Lead', 'Engineering Manager'],
  Product: ['Product Manager', 'Product Analyst', 'Product Owner', 'Associate PM'],
  Design: ['UI Designer', 'UX Designer', 'UX Researcher', 'Design Lead', 'Graphic Designer'],
  Marketing: ['Marketing Manager', 'Content Writer', 'SEO Specialist', 'Social Media Manager', 'Growth Analyst'],
  Sales: ['Sales Executive', 'Account Manager', 'Sales Manager', 'Business Development Rep'],
  HR: ['HR Manager', 'Recruiter', 'HR Business Partner', 'Talent Acquisition Lead'],
  Finance: ['Financial Analyst', 'Accountant', 'Finance Manager', 'Controller'],
  Operations: ['Operations Manager', 'Project Manager', 'Business Analyst', 'Process Analyst'],
  'Customer Support': ['Support Engineer', 'Support Manager', 'Customer Success Manager', 'Technical Support'],
  Legal: ['Legal Counsel', 'Compliance Officer', 'Paralegal', 'Contract Manager'],
};

const ProfileSetup = () => {
  const { profile, updateProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);

  const availableRoles = department ? rolesByDepartment[department] || [] : [];

  const handleSubmit = async () => {
    if (!department || !role) {
      toast.error('Please select both department and role');
      return;
    }
    setSaving(true);
    await updateProfile({ department, role, is_first_login: false });
    toast.success('Profile set up! Your personalized onboarding plan is ready.', { icon: <Sparkles className="w-4 h-4" /> });
    navigate('/welcome');
    setSaving(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-blue flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card shadow-xl mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">Welcome aboard!</h1>
          <p className="text-primary-foreground/80">
            Tell us about your role so we can personalize your onboarding experience
          </p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle>Set Up Your Profile</CardTitle>
            <CardDescription>
              Select your department and role to get a tailored day-by-day onboarding plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Department
              </Label>
              <Select
                value={department}
                onValueChange={(v) => {
                  setDepartment(v);
                  setRole('');
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Role
              </Label>
              <Select value={role} onValueChange={setRole} disabled={!department}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={department ? 'Select your role' : 'Select department first'} />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {department && role && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                <p className="text-sm font-medium">Your onboarding will include:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 7-day personalized task plan for <strong className="text-foreground">{role}</strong></li>
                  <li>• Department-specific documents & SOPs for <strong className="text-foreground">{department}</strong></li>
                  <li>• AI assistant tuned to your role context</li>
                </ul>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!department || !role || saving}
              className="w-full h-11 bg-gradient-orange hover:opacity-90 transition-opacity"
            >
              {saving ? 'Setting up...' : 'Start My Onboarding'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
