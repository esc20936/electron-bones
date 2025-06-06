# 🎯 Electron Bones Examples

This document provides practical examples of how to use the features included in Electron Bones. Each example includes complete code snippets and explanations.

## 📋 Table of Contents

- [🖥️ Window Management](#️-window-management)
- [💬 Inter-Process Communication](#-inter-process-communication)
- [💾 Data Persistence](#-data-persistence)
- [🔔 Notifications](#-notifications)
- [⌨️ Keyboard Shortcuts](#️-keyboard-shortcuts)
- [🎨 UI Components](#-ui-components)
- [🌙 Theme Management](#-theme-management)
- [📂 File Operations](#-file-operations)
- [🔄 Auto Updates](#-auto-updates)
- [🖱️ System Integration](#️-system-integration)

---

## 🖥️ Window Management

### Creating Child Windows

Create settings, about dialogs, or any secondary windows:

```typescript
// src/main/create-window.ts
import { createChildWindow } from './create-window'

// Settings window
const settingsWindow = createChildWindow({
  title: 'Settings',
  width: 800,
  height: 600,
  route: '/settings',
  resizable: true,
  minimizable: false
})

// About dialog
const aboutWindow = createChildWindow({
  title: 'About',
  width: 400,
  height: 300,
  route: '/about',
  resizable: false,
  modal: true
})
```

### Window State Management

```typescript
// Save and restore window position/size
import { store } from './store'

const saveWindowState = (window: BrowserWindow) => {
  const bounds = window.getBounds()
  store.set('window.bounds', bounds)
}

const restoreWindowState = (window: BrowserWindow) => {
  const bounds = store.get('window.bounds') as Rectangle
  if (bounds) {
    window.setBounds(bounds)
  }
}
```

### Progress Bar in Taskbar

```typescript
// Show download/upload progress
import { BrowserWindow } from 'electron'

const updateProgress = (percentage: number) => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) {
    window.setProgressBar(percentage / 100)
  }
}

// Clear progress when complete
const clearProgress = () => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) {
    window.setProgressBar(-1)
  }
}
```

---

## 💬 Inter-Process Communication

### Type-Safe IPC Handlers

```typescript
// src/main/ipc.ts - Main process handlers
import { ipcMain, app, dialog } from 'electron'

// Get app version
ipcMain.handle('app:get-version', (): string => {
  return app.getVersion()
})

// Show save dialog
ipcMain.handle('dialog:save-file', async (): Promise<string | null> => {
  const result = await dialog.showSaveDialog({
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return result.canceled ? null : result.filePath
})

// Handle user data
interface UserData {
  name: string
  email: string
}

ipcMain.handle('user:save', async (_, userData: UserData): Promise<boolean> => {
  try {
    store.set('user', userData)
    return true
  } catch (error) {
    console.error('Failed to save user data:', error)
    return false
  }
})
```

```typescript
// src/renderer/hooks/useElectronAPI.ts - Renderer process hooks
import { useCallback } from 'react'

export const useElectronAPI = () => {
  const getAppVersion = useCallback(async (): Promise<string> => {
    return await window.electronAPI.invoke('app:get-version')
  }, [])

  const saveFile = useCallback(async (): Promise<string | null> => {
    return await window.electronAPI.invoke('dialog:save-file')
  }, [])

  const saveUser = useCallback(async (userData: UserData): Promise<boolean> => {
    return await window.electronAPI.invoke('user:save', userData)
  }, [])

  return {
    getAppVersion,
    saveFile,
    saveUser
  }
}
```

### Real-time Communication

```typescript
// src/main/ipc.ts - Send updates to renderer
import { BrowserWindow } from 'electron'

const sendToRenderer = (channel: string, data: any) => {
  const windows = BrowserWindow.getAllWindows()
  windows.forEach(window => {
    window.webContents.send(channel, data)
  })
}

// Example: Send download progress
const onDownloadProgress = (progress: number) => {
  sendToRenderer('download:progress', { progress })
}
```

```typescript
// src/renderer/hooks/useIPCListener.ts - Listen for updates
import { useEffect, useState } from 'react'

export const useDownloadProgress = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleProgress = (data: { progress: number }) => {
      setProgress(data.progress)
    }

    window.electronAPI.on('download:progress', handleProgress)

    return () => {
      window.electronAPI.removeListener('download:progress', handleProgress)
    }
  }, [])

  return progress
}
```

---

## 💾 Data Persistence

### User Preferences

```typescript
// src/main/store.ts - Store management
import Store from 'electron-store'

interface StoreSchema {
  user: {
    name: string
    email: string
    preferences: {
      theme: 'light' | 'dark' | 'system'
      notifications: boolean
      autoStart: boolean
    }
  }
  window: {
    bounds: Rectangle
    isMaximized: boolean
  }
}

export const store = new Store<StoreSchema>({
  defaults: {
    user: {
      name: '',
      email: '',
      preferences: {
        theme: 'system',
        notifications: true,
        autoStart: false
      }
    }
  }
})

// Watch for changes
store.onDidChange('user.preferences.theme', (newValue, oldValue) => {
  console.log('Theme changed:', oldValue, '->', newValue)
  // Update UI theme
})
```

### Application Cache

```typescript
// src/main/cache.ts - Simple caching system
class AppCache {
  private cache = new Map<string, { data: any; expires: number }>()

  set(key: string, data: any, ttlMs: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }
}

export const cache = new AppCache()
```

---

## 🔔 Notifications

### System Notifications

```typescript
// src/main/notifications.ts
import { Notification } from 'electron'

export const showNotification = (title: string, body: string, options?: {
  icon?: string
  sound?: boolean
  actions?: Array<{ type: 'button'; text: string }>
}) => {
  if (!Notification.isSupported()) {
    console.warn('Notifications not supported')
    return
  }

  const notification = new Notification({
    title,
    body,
    icon: options?.icon,
    silent: !options?.sound,
    actions: options?.actions
  })

  notification.show()
  return notification
}

// Usage examples
showNotification('Download Complete', 'Your file has been downloaded successfully')

showNotification('Update Available', 'A new version is available', {
  icon: path.join(__dirname, 'assets/update-icon.png'),
  sound: true,
  actions: [
    { type: 'button', text: 'Update Now' },
    { type: 'button', text: 'Later' }
  ]
})
```

### In-App Notifications with Sonner

```typescript
// src/renderer/components/NotificationDemo.tsx
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export const NotificationDemo = () => {
  const showSuccess = () => {
    toast.success('Success!', {
      description: 'Operation completed successfully.'
    })
  }

  const showError = () => {
    toast.error('Error occurred', {
      description: 'Something went wrong. Please try again.'
    })
  }

  const showCustom = () => {
    toast('Custom notification', {
      description: 'This is a custom notification with an action',
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked')
      }
    })
  }

  return (
    <div className="space-y-4">
      <Button onClick={showSuccess}>Show Success</Button>
      <Button onClick={showError} variant="destructive">Show Error</Button>
      <Button onClick={showCustom} variant="outline">Show Custom</Button>
    </div>
  )
}
```

---

## ⌨️ Keyboard Shortcuts

### Global Shortcuts

```typescript
// src/main/keyboard.ts
import { globalShortcut, BrowserWindow } from 'electron'

export const registerGlobalShortcuts = () => {
  // Show/hide app
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      if (window.isVisible()) {
        window.hide()
      } else {
        window.show()
        window.focus()
      }
    }
  })

  // Quick capture
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    // Trigger screenshot or quick action
    console.log('Quick capture triggered')
  })

  // Open settings
  globalShortcut.register('CommandOrControl+,', () => {
    // Open settings window
    createChildWindow({ route: '/settings' })
  })
}

export const unregisterAllShortcuts = () => {
  globalShortcut.unregisterAll()
}
```

### Local Shortcuts (Within App)

```typescript
// src/renderer/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react'

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + N - New item
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault()
        // Handle new item creation
      }

      // Ctrl/Cmd + S - Save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        // Handle save
      }

      // Escape - Close modals
      if (event.key === 'Escape') {
        // Close any open modals
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}
```

---

## 🎨 UI Components

### Custom Form with Validation

```typescript
// src/renderer/components/forms/UserForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old')
})

type UserFormData = z.infer<typeof userSchema>

export const UserForm = () => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 18
    }
  })

  const onSubmit = async (data: UserFormData) => {
    try {
      const success = await window.electronAPI.invoke('user:save', data)
      if (success) {
        toast.success('User saved successfully!')
      } else {
        toast.error('Failed to save user')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Save User
        </Button>
      </form>
    </Form>
  )
}
```

### Data Table with Actions

```typescript
// src/renderer/components/tables/UsersTable.tsx
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export const UsersTable = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' }
  ])

  const handleEdit = (user: User) => {
    console.log('Edit user:', user)
  }

  const handleDelete = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId))
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(user)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(user.id)}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## 🌙 Theme Management

### Theme Provider Setup

```typescript
// src/renderer/components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    // Load theme from store
    const loadTheme = async () => {
      const savedTheme = await window.electronAPI.invoke('store:get', 'user.preferences.theme')
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
    loadTheme()
  }, [])

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    // Save theme to store
    window.electronAPI.invoke('store:set', 'user.preferences.theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

### Theme Toggle Component

```typescript
// src/renderer/components/ThemeToggle.tsx
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTheme } from './ThemeProvider'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## 📂 File Operations

### Drag and Drop

```typescript
// src/renderer/components/FileDropZone.tsx
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const FileDropZone = () => {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md']
    }
  })

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    for (const file of files) {
      const filePath = await window.electronAPI.invoke('dialog:save-file')
      if (filePath) {
        // Process file upload
        console.log('Uploading file:', file.name, 'to:', filePath)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <div>
            <p>Drag & drop files here, or click to select files</p>
            <p className="text-sm text-gray-500 mt-2">
              Supports images, PDFs, and text files
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Selected Files:</h3>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <div className="flex items-center">
                <File className="h-4 w-4 mr-2" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleUpload} className="w-full">
            Upload {files.length} file(s)
          </Button>
        </div>
      )}
    </div>
  )
}
```

### Recent Documents

```typescript
// src/main/recent-documents.ts
import { app } from 'electron'
import { store } from './store'

export const addRecentDocument = (filePath: string) => {
  app.addRecentDocument(filePath)
  
  // Also store in our app store for cross-platform compatibility
  const recent = store.get('recentDocuments', []) as string[]
  const updated = [filePath, ...recent.filter(path => path !== filePath)].slice(0, 10)
  store.set('recentDocuments', updated)
}

export const clearRecentDocuments = () => {
  app.clearRecentDocuments()
  store.set('recentDocuments', [])
}

export const getRecentDocuments = (): string[] => {
  return store.get('recentDocuments', []) as string[]
}
```

---

## 🔄 Auto Updates

### Update Manager

```typescript
// src/main/auto-update.ts
import { autoUpdater } from 'electron-updater'
import { BrowserWindow, dialog } from 'electron'
import { store } from './store'

class UpdateManager {
  private checkingForUpdate = false
  private downloadingUpdate = false

  constructor() {
    this.setupAutoUpdater()
  }

  private setupAutoUpdater() {
    // Configure auto updater
    autoUpdater.checkForUpdatesAndNotify()

    // Events
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...')
      this.checkingForUpdate = true
    })

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version)
      this.showUpdateDialog(info)
    })

    autoUpdater.on('update-not-available', () => {
      console.log('Update not available')
      this.checkingForUpdate = false
    })

    autoUpdater.on('error', (err) => {
      console.error('Auto updater error:', err)
      this.checkingForUpdate = false
      this.downloadingUpdate = false
    })

    autoUpdater.on('download-progress', (progressObj) => {
      const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
      console.log(message)
      
      // Send progress to renderer
      const windows = BrowserWindow.getAllWindows()
      windows.forEach(window => {
        window.webContents.send('update:download-progress', progressObj)
      })
    })

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded')
      this.downloadingUpdate = false
      this.showInstallDialog()
    })
  }

  private async showUpdateDialog(info: any) {
    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available. Would you like to download it now?`,
      buttons: ['Download', 'Later'],
      defaultId: 0
    })

    if (result.response === 0) {
      this.downloadUpdate()
    }
  }

  private async showInstallDialog() {
    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. The application will restart to apply the update.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    })

    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  }

  public downloadUpdate() {
    if (!this.downloadingUpdate) {
      this.downloadingUpdate = true
      autoUpdater.downloadUpdate()
    }
  }

  public checkForUpdates() {
    if (!this.checkingForUpdate) {
      autoUpdater.checkForUpdates()
    }
  }

  public quitAndInstall() {
    autoUpdater.quitAndInstall()
  }
}

export const updateManager = new UpdateManager()
```

---

## 🖱️ System Integration

### System Tray

```typescript
// src/main/tray.ts
import { Tray, Menu, nativeImage, BrowserWindow } from 'electron'
import path from 'path'

export const createTray = (): Tray => {
  // Create tray icon
  const iconPath = path.join(__dirname, '../assets/icons/tray-icon.png')
  const trayIcon = nativeImage.createFromPath(iconPath)
  const tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))

  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        const windows = BrowserWindow.getAllWindows()
        if (windows.length > 0) {
          windows[0].show()
          windows[0].focus()
        }
      }
    },
    {
      label: 'Settings',
      click: () => {
        // Open settings window
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('Electron Bones')
  tray.setContextMenu(contextMenu)

  // Handle double click
  tray.on('double-click', () => {
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      windows[0].show()
      windows[0].focus()
    }
  })

  return tray
}
```

### File Associations

```typescript
// src/main/file-associations.ts
import { app } from 'electron'

export const setupFileAssociations = () => {
  // Set as default app for custom protocol
  app.setAsDefaultProtocolClient('electron-bones')

  // Handle protocol URLs
  app.on('open-url', (event, url) => {
    event.preventDefault()
    console.log('Protocol URL opened:', url)
    // Handle custom protocol URLs
  })

  // Handle file associations (Windows/Linux)
  app.on('open-file', (event, filePath) => {
    event.preventDefault()
    console.log('File opened:', filePath)
    // Handle file opening
  })
}
```

### Spell Check

```typescript
// src/main/create-window.ts
const createWindow = () => {
  const window = new BrowserWindow({
    webPreferences: {
      spellcheck: true,
      // other preferences...
    }
  })

  // Handle spell check context menu
  window.webContents.on('context-menu', (event, params) => {
    if (params.misspelledWord) {
      const menu = Menu.buildFromTemplate([
        // Add spelling suggestions
        ...params.dictionarySuggestions.map(suggestion => ({
          label: suggestion,
          click: () => window.webContents.replaceMisspelling(suggestion)
        })),
        { type: 'separator' },
        {
          label: 'Add to dictionary',
          click: () => {
            window.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
          }
        }
      ])
      menu.popup()
    }
  })

  return window
}
```

---

## 🎵 Bonus: Sound System

```typescript
// src/main/sounds.ts
import path from 'path'
import { BrowserWindow } from 'electron'

export enum SoundType {
  SUCCESS = 'success',
  ERROR = 'error',
  NOTIFICATION = 'notification',
  CLICK = 'click'
}

export const playSound = (soundType: SoundType) => {
  const soundPath = path.join(__dirname, '../assets/sounds/ui-sounds', `${soundType}.wav`)
  
  const windows = BrowserWindow.getAllWindows()
  if (windows.length > 0) {
    windows[0].webContents.executeJavaScript(`
      const audio = new Audio('${soundPath}')
      audio.play().catch(console.error)
    `)
  }
}
```

---

## 🚀 Getting Started with Examples

1. **Copy any example** into your project
2. **Install required dependencies** if not already included
3. **Adapt the code** to your specific use case
4. **Test thoroughly** on your target platforms

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com/)

---

**Happy coding! 🎉** These examples should give you a solid foundation for building amazing desktop applications with Electron Bones.
