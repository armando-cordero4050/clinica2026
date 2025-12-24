# DentalFlow UI Kit

## Core libraries
- **TailwindCSS**: Utility-first CSS.
- **shadcn/ui**: Reusable components built with Radix UI.
- **Lucide React**: Icons.
- **Framer Motion**: Animations.

## Design System tokens
- `primary`: Blue/slate spectrum (defined in `index.css`).
- `destructive`: Red for errors/danger actions.
- `muted`: Key for standard UI backgrounds to reduce visual noise.

## Components
Components are located in `src/shared/ui/` (generic) or within modules if specific.
- **AppShell**: Main layout.
- **DataTable**: Standard data tables.
- **CommandPalette**: Global search (CMD+k).

## Best Practices
- Always support Dark Mode.
- Use `Loading` skeletons for async data.
- Use `Empty` states for no data.
- Interactive elements must provide visual feedback (hover/active).
