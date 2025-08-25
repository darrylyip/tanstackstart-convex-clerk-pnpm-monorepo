# 8. Multi-Organization UI Architecture

## Organization Context Management
```tsx
// Organization switching must be prominent in all layouts
// Uses OrganizationProvider from frontend-architecture.md
<Header>
  <OrganizationSwitcher />
  <UserMenu />
</Header>

// All data queries scoped to current organization
const schedules = useQuery(
  api.schedules.list,
  currentOrg ? { organizationId: currentOrg._id } : "skip"
);
```

## Multi-Tenant Data Filtering
```tsx
// Example: SchedulableContacts list with org context
function ContactsList() {
  const { currentOrg, userMembership } = useOrganization();
  
  const contacts = useQuery(
    api.schedulableContacts.list,
    currentOrg ? { organizationId: currentOrg._id } : "skip"
  );
  
  // Role-based UI rendering
  const canEdit = userMembership?.role === 'admin' || userMembership?.role === 'staff';
  
  return (
    <div className="space-y-4">
      {contacts?.map(contact => (
        <ContactCard 
          key={contact._id}
          contact={contact}
          editable={canEdit}
        />
      ))}
    </div>
  );
}
```

## Organization Rules Display
```tsx
// Show organization-specific constraints in UI
function SchedulingRulesPanel() {
  const { currentOrg } = useOrganization();
  const orgRules = useQuery(
    api.organizationSchedulingRules.get,
    currentOrg ? { organizationId: currentOrg._id } : "skip"
  );

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">Organization Rules</h3>
      {orgRules?.mandatoryConstraints && (
        <div className="space-y-2">
          <Badge variant="destructive">Mandatory Constraints</Badge>
          <ul className="text-sm space-y-1">
            {orgRules.mandatoryConstraints.maxConsecutiveDays && (
              <li>Max consecutive days: {orgRules.mandatoryConstraints.maxConsecutiveDays}</li>
            )}
            {orgRules.mandatoryConstraints.maxHoursPerWeek && (
              <li>Max hours per week: {orgRules.mandatoryConstraints.maxHoursPerWeek}</li>
            )}
          </ul>
        </div>
      )}
    </Card>
  );
}
```
