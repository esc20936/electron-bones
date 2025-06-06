# 🦴 Electron Bones

> **The most complete Electron boilerplate for building production-ready desktop applications**

A modern, batteries-included Electron boilerplate that gets you from idea to shipping in minutes, not days. Built with React, TypeScript, and the latest best practices.

<div align="center">

[![Build Status][github-actions-status]][github-actions-url]
[![Github Tag][github-tag-image]][github-tag-url]
[![License: CC-BY-NC-SA-4.0](https://img.shields.io/badge/License-CC--BY--NC--SA--4.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [📖 Documentation](#-documentation) • [🎯 Examples](#-examples) • [🤝 Contributing](#-contributing)

</div>

---

## 🎯 Why Electron Bones?

**Stop wasting time on boilerplate setup.** Electron Bones includes everything you need to build professional desktop applications:

- ⚡ **Zero Configuration** - Works out of the box with sensible defaults
- 🏗️ **Production Ready** - Includes auto-updater, error handling, and analytics
- 🎨 **Modern UI** - Beautiful components with Tailwind CSS and Shadcn/ui
- � **Developer Experience** - Hot reload, TypeScript, linting, and testing
- 📦 **Cross Platform** - Build for Windows, macOS, and Linux simultaneously
- 🔌 **Extensible** - Well-structured architecture for easy customization

## ✨ Features

### 🚀 **Core Features**
- **React 18** with hooks and modern patterns
- **TypeScript** for type-safe development
- **Tailwind CSS** for rapid styling
- **Shadcn/ui** for beautiful, accessible components
- **Hot Module Replacement** for instant development feedback

### 🏗️ **Production Features**
- **Auto Updater** - Seamless app updates for users
- **Error Handling** - Comprehensive error tracking and reporting
- **Analytics** - Built-in usage analytics with Aptabase
- **Logging** - Structured logging for debugging
- **Store Management** - Persistent app settings with electron-store

### 🎨 **UI/UX Features**
- **Dark Mode** - System-aware theme switching
- **Multi-Window Support** - Main window and child windows
- **System Tray** - Background app functionality
- **Native Menus** - Platform-specific menu bars
- **Notifications** - App and system-wide notifications
- **Context Menus** - Right-click functionality

### ⌨️ **Developer Features**
- **Keyboard Shortcuts** - Customizable hotkey management
- **IPC Communication** - Type-safe inter-process communication
- **Testing Setup** - Jest and React Testing Library
- **Code Quality** - ESLint, Prettier, and Husky pre-commit hooks
- **Build Tools** - Webpack with optimized production builds

## 🚀 Quick Start

Get up and running in less than 2 minutes:

```bash
# Clone the repository
git clone https://github.com/lacymorrow/electron-bones.git my-app

# Navigate to your project
cd my-app

# Install dependencies
npm install

# Start development
npm start
```

That's it! Your app will open automatically with hot reload enabled.

## � Documentation

### 🏗️ Project Structure

```
src/
├── main/              # Main process (Node.js)
│   ├── main.ts       # App entry point
│   ├── windows.ts    # Window management
│   ├── menu.ts       # Application menus
│   ├── ipc.ts        # IPC handlers
│   └── ...
├── renderer/          # Renderer process (React)
│   ├── components/   # UI components
│   ├── views/        # App screens
│   ├── context/      # React context
│   └── ...
└── types/            # TypeScript definitions
```

### �️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development with hot reload |
| `npm run build` | Build for production |
| `npm run package` | Package app for all platforms |
| `npm run package:mac` | Package for macOS only |
| `npm run package:windows` | Package for Windows only |
| `npm run package:linux` | Package for Linux only |
| `npm test` | Run test suite |
| `npm run lint` | Run linting |

### 🎨 Styling

**Tailwind CSS** is pre-configured with useful plugins:
- `tailwindcss-animate` for smooth animations
- `@tailwindcss/container-queries` for responsive containers
- Custom child selectors: `child:w-xl`
- Group selectors: `group-hover:bg-gray-100`

**Shadcn/ui Components** are available out of the box:
```bash
# Add new components
npx shadcn@latest add button card dialog
```

### 🔌 Adding Features

**IPC Communication:**
```typescript
// Main process
ipcMain.handle('get-app-version', () => app.getVersion())

// Renderer process
const version = await window.electronAPI.getAppVersion()
```

**Store Management:**
```typescript
import { store } from './store'

// Save data
store.set('user.name', 'John Doe')

// Load data
const userName = store.get('user.name')
```

## 🎯 Examples

### Multi-Window Apps
Create child windows for settings, about dialogs, or secondary views:

```typescript
import { createChildWindow } from './create-window'

const settingsWindow = createChildWindow({
  title: 'Settings',
  width: 600,
  height: 400,
  route: '/settings'
})
```

### System Integration
Add your app to the system tray:

```typescript
import { createTray } from './tray'

const tray = createTray()
tray.setContextMenu(Menu.buildFromTemplate([
  { label: 'Show App', click: () => mainWindow.show() },
  { label: 'Quit', click: () => app.quit() }
]))
```

### Auto Updates
Enable seamless updates for your users:

```typescript
// Uncomment in auto-update.ts after first release
autoUpdater.checkForUpdatesAndNotify()
```

## � Deployment

### Building for Production

```bash
# Build for all platforms
npm run package

# Build for specific platform
npm run package:mac     # macOS
npm run package:windows # Windows
npm run package:linux   # Linux
```

### Auto Updates

1. **First Release**: Package and distribute your app
2. **Enable Updates**: Uncomment the auto-updater in `src/main/auto-update.ts`
3. **Subsequent Releases**: The app will automatically update

### Code Signing

Configure code signing in `package.json` under the `build` section for distribution on app stores.

## 🎨 Customization

### Branding
- Replace icons in `assets/icons/`
- Update `package.json` metadata
- Customize the About dialog in settings

### Themes
- Modify Tailwind config in `tailwind.config.js`
- Add custom CSS in `src/renderer/styles/`
- Use the theme context for dark/light mode

### Menus
- Edit `src/main/menu.ts` for application menus
- Modify `src/main/context-menu.ts` for right-click menus

## 🧪 Testing

Run the test suite:
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the [CC-BY-NC-SA-4.0](LICENSE) License.

## 🙏 Acknowledgments

Built on the shoulders of giants:
- [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) - The original inspiration
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

<div align="center">

**[⭐ Star this repo](https://github.com/lacymorrow/electron-bones) if it helped you build something awesome!**

Made with ❤️ by [Lacy Morrow](https://lacymorrow.com)

</div>

[github-actions-status]: https://github.com/lacymorrow/electron-bones/workflows/Build/badge.svg
[github-actions-url]: https://github.com/lacymorrow/electron-bones/actions
[github-tag-image]: https://img.shields.io/github/tag/lacymorrow/electron-bones.svg?label=version
[github-tag-url]: https://github.com/lacymorrow/electron-bones/releases/latest
