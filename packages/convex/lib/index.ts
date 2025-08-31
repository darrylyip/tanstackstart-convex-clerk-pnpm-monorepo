// Common utility functions for Convex backend
export const getCurrentTimestamp = (): number => {
  return Date.now();
};

// Helper function to validate organization access
export const validateOrganizationAccess = async (
  ctx: any,
  organizationId: string
): Promise<boolean> => {
  // TODO: Add authentication and authorization logic
  // This is a placeholder for future implementation
  return true;
};

// Helper function to generate unique slugs
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};