# 10. Development Workflow

## shadcn MCP Server Integration
```bash
# Component discovery via MCP
npx shadcn-ui-mcp-server

# AI-assisted component selection
# Use MCP server to:
# - Browse available components
# - Get component source code
# - Access usage demos
# - Retrieve dependency information
```

## Component Development Process
1. **Design Review**: Confirm component requirements with stakeholders
2. **shadcn Selection**: Use MCP server to find best base component
3. **Customization**: Extend with healthcare-specific features
4. **Testing**: Accessibility, responsiveness, theme switching
5. **Documentation**: Update component library docs
6. **Integration**: Add to design system

## Quality Gates
- **Accessibility**: axe-core automated testing
- **Performance**: Lighthouse CI checks
- **Theme Testing**: Light/dark mode validation
- **Responsive Testing**: Cross-device verification
- **Motion Testing**: Reduced motion preference support
