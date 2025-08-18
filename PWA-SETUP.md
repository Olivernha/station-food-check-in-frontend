# PWA Setup Guide

## Overview

Your Meal Check-In System is now configured as a Progressive Web App (PWA) with the following features:

## PWA Features Implemented

### 1. **App Manifest**

- App name: "Meal Check-In System"
- Short name: "MealCheck"
- Theme color: #4f46e5 (Indigo)
- Display mode: Standalone
- Orientation: Portrait

### 2. **Service Worker**

- Automatic updates
- Offline caching
- Background sync capabilities

### 3. **Install Prompts**

- Custom install prompt for better UX
- Automatic update notifications
- Offline status indicator

### 4. **Icons Required**

You need to replace the placeholder files with actual PNG images:

- `public/pwa-192x192.png` - 192x192 pixels
- `public/pwa-512x512.png` - 512x512 pixels
- `public/apple-touch-icon.png` - 180x180 pixels
- `public/favicon.ico` - 32x32 pixels

### 5. **Mobile Optimization**

- Responsive design with Vuetify
- Touch-friendly interface
- Proper viewport settings
- iOS splash screen support

## How to Test PWA

### 1. **Development**

```bash
npm run dev
```

- Open Chrome DevTools
- Go to Application tab
- Check Manifest and Service Workers sections

### 2. **Production Build**

```bash
npm run build
npm run preview
```

### 3. **Install Testing**

- Open in Chrome/Edge
- Look for install prompt in address bar
- Or use "Install app" from browser menu

### 4. **Mobile Testing**

- Open on mobile browser
- Add to Home Screen option should appear
- Test offline functionality

## PWA Capabilities

### ✅ **Installable**

- Can be installed on desktop and mobile
- Appears in app drawer/start menu
- Runs in standalone window

### ✅ **Offline Support**

- Basic offline functionality
- Cached resources work offline
- Offline indicator shows connection status

### ✅ **Auto-Updates**

- Automatic service worker updates
- User notification for new versions
- Seamless update process

### ✅ **Mobile-First**

- Responsive design
- Touch gestures
- Mobile-optimized UI

## Browser Support

### **Full PWA Support:**

- Chrome (Android/Desktop)
- Edge (Windows/Android)
- Safari (iOS 11.3+)
- Firefox (Android)

### **Partial Support:**

- Safari (macOS) - Limited install options
- Firefox (Desktop) - No install prompt

## Production Deployment

### **HTTPS Required**

- PWAs require HTTPS in production
- Service workers only work over HTTPS
- Use SSL certificate for your domain

### **Web Server Configuration**

- Ensure proper MIME types for manifest
- Configure caching headers
- Enable compression for better performance

## Customization Options

### **Manifest Customization**

Edit `vite.config.ts` to modify:

- App name and description
- Theme colors
- Display mode
- Orientation
- Categories

### **Service Worker Options**

Modify workbox settings in `vite.config.ts`:

- Cache strategies
- Offline fallbacks
- Background sync
- Push notifications

## Next Steps

1. **Replace placeholder icons** with your app icons
2. **Test on various devices** and browsers
3. **Configure push notifications** (optional)
4. **Add background sync** for offline data
5. **Implement app shortcuts** for quick actions

## Troubleshooting

### **Service Worker Issues**

- Clear browser cache
- Check DevTools Console for errors
- Verify HTTPS in production

### **Install Issues**

- Check manifest.json is accessible
- Verify all required icons exist
- Test install criteria are met

### **Update Issues**

- Force refresh (Ctrl+F5)
- Clear application data in DevTools
- Check service worker registration
