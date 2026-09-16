import React, { useState, useRef, useEffect } from 'react';
import type { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  favoriteCount: number;
  cartItemCount: number;
  orderCount: number;
  unreadNotificationCount?: number;
  onOpenCart: () => void;
  onOpenNotifications?: () => void;
  onOpenAuth?: () => void;
  currentUser?: { name: string; email: string } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  favoriteCount,
  cartItemCount,
  orderCount,
  unreadNotificationCount = 0,
  onOpenCart,
  onOpenNotifications,
  onOpenAuth,
  currentUser,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setIsProfileMenuOpen(false);
    if (role === 'CUSTOMER') {
      setActiveTab('customer-dashboard');
    } else if (role === 'TAILOR') {
      setActiveTab('tailor-dashboard');
    } else if (role === 'ADMIN') {
      setActiveTab('admin');
    } else if (role === 'DELIVERY_AGENT') {
      setActiveTab('delivery');
    }
  };

  interface NavItem {
    id: string;
    label: string;
    badge?: number;
  }

  // CUSTOMER Navigation Tabs
  const customerNavItems: NavItem[] = [
    { id: 'discover', label: 'Discover' },
    { id: 'measure', label: 'Measure' },
    { id: 'customize', label: 'Customize', badge: favoriteCount > 0 ? favoriteCount : undefined },
    { id: 'order', label: 'Order', badge: cartItemCount > 0 ? cartItemCount : undefined },
    { id: 'track', label: 'Track', badge: orderCount > 0 ? orderCount : undefined },
  ];

  // TAILOR Navigation Tabs
  const tailorNavItems: NavItem[] = [
    { id: 'products', label: 'Products' },
    { id: 'tailor-orders', label: 'Orders' },
    { id: 'client-measurements', label: 'Measurements' },
    { id: 'production', label: 'Production' },
    { id: 'tailor-delivery', label: 'Delivery' },
  ];

  // DELIVERY Navigation Tabs
  const deliveryNavItems: NavItem[] = [
    { id: 'delivery-jobs', label: 'Jobs' },
    { id: 'delivery-pickup', label: 'Pickup' },
    { id: 'delivery-transit', label: 'Transit' },
    { id: 'delivery-complete', label: 'Delivery' },
  ];

  // ADMIN Navigation Tabs
  const adminNavItems: NavItem[] = [
    { id: 'admin-users', label: 'Users' },
    { id: 'admin-tailors', label: 'Tailors' },
    { id: 'admin-products', label: 'Products' },
    { id: 'admin-orders', label: 'Orders' },
    { id: 'admin-payments', label: 'Payments' },
    { id: 'admin-reports', label: 'Reports' },
    { id: 'admin-system', label: 'System' },
  ];

  const currentNavItems =
    activeRole === 'TAILOR'
      ? tailorNavItems
      : activeRole === 'DELIVERY_AGENT'
      ? deliveryNavItems
      : activeRole === 'ADMIN'
      ? adminNavItems
      : customerNavItems;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(8, 12, 20, 0.96)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          gap: '20px',
        }}
      >
        {/* BRAND LOGO */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => setActiveTab(activeRole === 'CUSTOMER' ? 'hero' : activeRole === 'TAILOR' ? 'tailor-dashboard' : activeRole === 'ADMIN' ? 'admin' : 'delivery')}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: activeRole === 'ADMIN'
                ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                : activeRole === 'TAILOR'
                ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: '800',
              color: '#000',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.3)',
            }}
          >
            S
          </div>
          <div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(90deg, #fff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
              }}
            >
              SEWFIT
            </div>
            <div style={{ fontSize: '0.625rem', color: activeRole === 'ADMIN' ? '#ef4444' : activeRole === 'TAILOR' ? '#10b981' : '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '700' }}>
              {activeRole === 'ADMIN' ? 'Admin Portal' : activeRole === 'TAILOR' ? 'Tailor Studio' : activeRole === 'DELIVERY_AGENT' ? 'Delivery Logistics' : 'Measure. Customize. Wear.'}
            </div>
          </div>
        </div>

        {/* ROLE-SCOPED NAVIGATION LINKS */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '4px 6px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {currentNavItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'discover' && (activeTab === 'hero' || activeTab === 'catalog' || activeTab === 'customer-dashboard' || activeTab === 'tailors'));
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'order') {
                    onOpenCart();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)' : 'transparent',
                  color: isActive ? '#f59e0b' : '#94a3b8',
                  border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    style={{
                      background: isActive ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                      color: isActive ? '#000' : '#cbd5e1',
                      borderRadius: '9999px',
                      padding: '1px 6px',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT ACTION BAR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notifications 🔔 */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              title="Notifications"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              <span>🔔</span>
              {unreadNotificationCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: '#ef4444',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    padding: '2px 5px',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
                  }}
                >
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Cart 🛒 (Customer Role only) */}
          {activeRole === 'CUSTOMER' && (
            <button
              onClick={onOpenCart}
              title="Shopping Cart"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: '#f59e0b',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <span>🛒</span>
              <span>Cart</span>
              <span
                style={{
                  background: '#f59e0b',
                  color: '#000000',
                  borderRadius: '9999px',
                  padding: '1px 7px',
                  fontSize: '0.72rem',
                  fontWeight: '900',
                }}
              >
                {cartItemCount}
              </span>
            </button>
          )}

          {/* PROFILE DROPDOWN MENU 👤 */}
          <div style={{ position: 'relative' }} ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              style={{
                background: isProfileMenuOpen
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: isProfileMenuOpen ? '#000' : '#f8fafc',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <span>👤 Profile</span>
              <span style={{ fontSize: '0.7rem' }}>{isProfileMenuOpen ? '▲' : '▼'}</span>
            </button>

            {/* PROFILE DROPDOWN PANEL */}
            {isProfileMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: '240px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '14px',
                  padding: '12px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                {/* Header: User Info */}
                <div style={{ padding: '6px 8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#f8fafc' }}>
                    {currentUser ? currentUser.name : 'SEWFIT User'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {currentUser ? currentUser.email : 'Account Active'}
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0 8px 0' }} />

                {/* MY ACCOUNT MENU ITEMS FOR CUSTOMER */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button
                    onClick={() => { setActiveTab(activeRole === 'TAILOR' ? 'tailor-dashboard' : activeRole === 'ADMIN' ? 'admin' : activeRole === 'DELIVERY_AGENT' ? 'delivery' : 'customer-dashboard'); setIsProfileMenuOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      background: 'transparent',
                      color: '#cbd5e1',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>👤</span> Profile Overview
                  </button>

                  {activeRole === 'CUSTOMER' && (
                    <>
                      <button
                        onClick={() => { setActiveTab('addresses'); setIsProfileMenuOpen(false); }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          background: 'transparent',
                          color: '#cbd5e1',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span>📍</span> Address Book
                      </button>

                      <button
                        onClick={() => { setActiveTab('measurements'); setIsProfileMenuOpen(false); }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          background: 'transparent',
                          color: '#cbd5e1',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span>📏</span> Measurement Profiles
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => { if (onOpenNotifications) onOpenNotifications(); setIsProfileMenuOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      background: 'transparent',
                      color: '#cbd5e1',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🔔</span> Notifications
                    </span>
                    {unreadNotificationCount > 0 && (
                      <span style={{ background: '#ef4444', color: '#fff', borderRadius: '9999px', padding: '1px 6px', fontSize: '0.65rem' }}>
                        {unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setActiveTab('support'); setIsProfileMenuOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      background: 'transparent',
                      color: '#cbd5e1',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🎧</span> Support Desk
                  </button>
                </div>

                {/* ADMIN WORKSPACE SWITCHER (EXCLUSIVELY FOR ADMIN & TESTING PURPOSES) */}
                {activeRole === 'ADMIN' && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '8px 0' }} />
                    <div style={{ padding: '4px 8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>
                        🛡️ Admin Workspace Switcher
                      </div>
                      {[
                        { role: 'CUSTOMER' as UserRole, label: 'Customer Experience' },
                        { role: 'TAILOR' as UserRole, label: 'Tailor Studio ✂️' },
                        { role: 'DELIVERY_AGENT' as UserRole, label: 'Delivery Fleet 🚚' },
                        { role: 'ADMIN' as UserRole, label: 'Admin Portal 🛡️' },
                      ].map((item) => (
                        <button
                          key={item.role}
                          onClick={() => handleRoleChange(item.role)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '6px 8px',
                            background: activeRole === item.role ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                            color: activeRole === item.role ? '#ef4444' : '#94a3b8',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.775rem',
                            fontWeight: activeRole === item.role ? '700' : '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '2px',
                          }}
                        >
                          <span>{item.label}</span>
                          {activeRole === item.role && <span style={{ fontSize: '0.7rem' }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '8px 0' }} />

                {/* LOGOUT / SIGN IN */}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onOpenAuth) onOpenAuth();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>🚪</span> {currentUser ? 'Sign Out' : 'Sign In / Register'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
