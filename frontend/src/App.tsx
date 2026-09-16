import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CatalogSection } from './components/CatalogSection';
import { TailorsSection } from './components/TailorsSection';
import { MeasurementsSection } from './components/MeasurementsSection';
import { DeliverySection } from './components/DeliverySection';
import { AdminSection } from './components/AdminSection';
import { FavoritesSection } from './components/FavoritesSection';
import { OrdersSection } from './components/OrdersSection';
import { CartDrawer } from './components/CartDrawer';
import { AddressSection } from './components/AddressSection';
import { PaymentModal } from './components/PaymentModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ReviewModal } from './components/ReviewModal';
import { SupportSection } from './components/SupportSection';
import { CustomerDashboard } from './components/CustomerDashboard';
import { TailorDashboard } from './components/TailorDashboard';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, ConfirmationModal, SkeletonLoader } from './components/UIComponents';
import { JourneyBanner } from './components/JourneyBanner';
import { HowItWorksSection } from './components/HowItWorksSection';
import type {
  UserRole,
  Tailor,
  ClothingProduct,
  MeasurementProfile,
  DeliveryJob,
  AdminMetrics,
  FavoriteItem,
  CartData,
  Order,
  OrderStatus,
  TailorProductionStage,
  ToastAlert,
  ConfirmationModalState,
  NotificationItem,
} from './types';
import {
  fetchTailors,
  fetchProducts,
  fetchMeasurementProfiles,
  fetchDeliveryJobs,
  fetchAdminMetrics,
  fetchFavorites,
  addFavorite,
  removeFavorite,
  fetchCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  fetchOrders,
  createOrder,
  updateOrderStatus,
  updateProductionStage,
  fetchNotifications,
} from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('customer-dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('CUSTOMER');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: UserRole } | null>(null);

  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [products, setProducts] = useState<ClothingProduct[]>([]);
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [deliveryJobs, setDeliveryJobs] = useState<DeliveryJob[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);

  // Favorites, Cart, Orders, Notifications, Payment & Address state
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [cart, setCart] = useState<CartData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Global Toast Notifications & Confirmation Modal System (Requirement 38)
  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmationModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadFavoritesAndCart = async () => {
    try {
      const [favData, cartData, ordersData] = await Promise.all([fetchFavorites(), fetchCart(), fetchOrders()]);
      setFavorites(favData);
      setCart(cartData);
      setOrders(ordersData);
    } catch (err) {
      console.warn('Error loading application state:', err);
    }
  };

  const reloadAdminMetrics = async () => {
    try {
      const metricsData = await fetchAdminMetrics();
      setAdminMetrics(metricsData);
      showToast('info', 'Admin Metrics Synced', 'Refreshed real DB metrics from backend');
    } catch (err) {
      showToast('error', 'Metrics Sync Failed', 'Could not refresh admin database metrics');
    }
  };

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const [tailorData, productData, profileData, deliveryData, metricsData, favData, cartData, ordersData, notifData] = await Promise.all([
          fetchTailors(),
          fetchProducts(),
          fetchMeasurementProfiles(),
          fetchDeliveryJobs(),
          fetchAdminMetrics(),
          fetchFavorites(),
          fetchCart(),
          fetchOrders(),
          fetchNotifications(),
        ]);
        setTailors(tailorData);
        setProducts(productData);
        setProfiles(profileData);
        setDeliveryJobs(deliveryData);
        setAdminMetrics(metricsData);
        setFavorites(favData);
        setCart(cartData);
        setOrders(ordersData);
        if (notifData) {
          setNotificationsList(notifData);
          setUnreadNotifications(notifData.filter((n) => !n.isRead).length);
        }
      } catch (err) {
        console.error('Failed to load application data:', err);
        showToast('error', 'Connection Alert', 'Loaded initial fallback state');
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const handleToggleFavorite = async (productId?: string, tailorId?: string) => {
    const existing = favorites.find((f) => {
      if (productId && f.productId) {
        const pId = typeof f.productId === 'object' ? String((f.productId as any).id || (f.productId as any)._id) : String(f.productId);
        return pId === productId;
      }
      if (tailorId && f.tailorId) {
        const tId = typeof f.tailorId === 'object' ? String((f.tailorId as any).id || (f.tailorId as any)._id) : String(f.tailorId);
        return tId === tailorId;
      }
      return false;
    });

    if (existing) {
      const favId = existing.id || existing.favoriteId || '';
      await removeFavorite(favId);
      showToast('info', 'Removed Favorite', 'Item removed from your favorites list');
    } else {
      await addFavorite(productId, tailorId);
      showToast('success', 'Favorite Saved', 'Item added to your favorites');
    }

    await loadFavoritesAndCart();
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    await removeFavorite(favoriteId);
    showToast('info', 'Removed Favorite', 'Item removed from your favorites list');
    await loadFavoritesAndCart();
  };

  const handleAddToCart = async (payload: {
    productId: string;
    tailorId: string;
    quantity: number;
    measurementProfileId: string;
    customization: Record<string, any>;
  }) => {
    await addToCart(payload);
    await loadFavoritesAndCart();
    setIsCartOpen(true);
    showToast('success', 'Added to Cart', 'Custom garment successfully configured and added');
  };

  const handleRemoveFromCart = async (productId: string) => {
    await removeFromCart(productId);
    await loadFavoritesAndCart();
    showToast('info', 'Item Removed', 'Removed item from shopping cart');
  };

  const handleUpdateCartQuantity = async (productId: string, quantity: number) => {
    const updated = await updateCartItemQuantity(productId, quantity);
    setCart(updated);
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: 'Confirm Garment Order Checkout',
      message: 'Create bespoke order with frozen measurement snapshots and server-validated pricing?',
      confirmText: 'Confirm & Place Order',
      cancelText: 'Review Cart',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        const firstItem = cart.items[0];
        const pObj = typeof firstItem.productId === 'object' ? (firstItem.productId as ClothingProduct) : null;
        const pId = pObj ? String(pObj.id || pObj.productId) : String(firstItem.productId);
        const tObj = typeof firstItem.tailorId === 'object' ? (firstItem.tailorId as Tailor) : null;

        const res = await createOrder({
          productId: pId,
          productName: pObj?.name || 'Custom Garment',
          tailorId: tObj ? String(tObj.id) : '1',
          tailorName: tObj?.businessName || 'Royal Habesha Couture',
          basePrice: pObj?.basePrice || 12500,
          customization: firstItem.customization || {},
          measurementProfile: profiles.find((p) => p.isCurrent) || profiles[0],
          quantity: firstItem.quantity,
        });

        setIsCartOpen(false);
        await loadFavoritesAndCart();
        setActiveTab('orders');
        showToast('success', 'Order Created!', `Order #${res.order.orderId} placed successfully. Initial status: PENDING_PAYMENT.`);
      },
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus, notes?: string) => {
    const res = await updateOrderStatus(orderId, newStatus, activeRole, notes);
    if (res.error) {
      showToast('error', 'Status Update Failed', res.error);
      throw new Error(res.error);
    }
    showToast('success', 'Order Updated', `Order #${orderId} moved to ${newStatus}`);
    await loadFavoritesAndCart();
  };

  const handleUpdateProductionStage = async (orderId: string, stage: TailorProductionStage, notes?: string) => {
    const res = await updateProductionStage(orderId, stage, notes);
    if (res.error) {
      showToast('error', 'Stage Update Failed', res.error);
      throw new Error(res.error);
    }
    showToast('success', 'Production Stage Advanced', `Order #${orderId} set to stage ${stage}`);
    await loadFavoritesAndCart();
  };

  const handleOpenPaymentModal = (order: Order) => {
    setPaymentModalOrder(order);
    setIsPaymentModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        favoriteCount={favorites.length}
        cartItemCount={cart?.totals.totalItems || 0}
        orderCount={orders.length}
        unreadNotificationCount={unreadNotifications}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
      />

      <main style={{ flex: 1 }}>
        <JourneyBanner
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasMeasurements={profiles.length > 0}
        />
        <div className="container" style={{ paddingBottom: '80px' }}>
          {loading ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f59e0b', marginBottom: '24px' }}>
                ⚡ Loading SEWFIT Engine & Database State...
              </div>
              <SkeletonLoader count={3} height="120px" />
            </div>
          ) : (
            <>
              {(activeTab === 'hero' || activeTab === 'discover') && (
                <>
                  {activeTab === 'hero' && <Hero setActiveTab={setActiveTab} />}
                  <CatalogSection
                    products={products}
                    favorites={favorites}
                    profiles={profiles}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToCart={handleAddToCart}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                </>
              )}
              {activeTab === 'how-it-works' && (
                <HowItWorksSection onNavigateTab={(tab) => setActiveTab(tab)} />
              )}
              {activeTab === 'customer-dashboard' && (
                <CustomerDashboard
                  profiles={profiles}
                  orders={orders}
                  products={products}
                  notifications={notificationsList}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenPaymentModal={handleOpenPaymentModal}
                  onAddToCart={handleAddToCart}
                />
              )}
              {(activeTab === 'tailor-dashboard' || activeTab === 'tailor-orders' || activeTab === 'production') && (
                <TailorDashboard
                  tailor={tailors[0]}
                  orders={orders}
                  products={products}
                  activeTab={activeTab}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onUpdateProductionStage={handleUpdateProductionStage}
                />
              )}
              {(activeTab === 'catalog' || activeTab === 'products') && (
                <CatalogSection
                  products={products}
                  favorites={favorites}
                  profiles={profiles}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === 'tailors' && (
                <TailorsSection
                  tailors={tailors}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
              {(activeTab === 'favorites' || activeTab === 'customize') && (
                <FavoritesSection
                  favorites={favorites}
                  onRemoveFavorite={handleRemoveFavorite}
                  onAddToCart={handleAddToCart}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onConfigureProduct={(_product) => {
                    setActiveTab('catalog');
                  }}
                />
              )}
              {(activeTab === 'orders' || activeTab === 'track') && (
                <OrdersSection
                  orders={orders}
                  activeRole={activeRole}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onUpdateProductionStage={handleUpdateProductionStage}
                  onOpenPaymentModal={handleOpenPaymentModal}
                  onOpenReviewModal={(order) => {
                    setReviewModalOrder(order);
                    setIsReviewModalOpen(true);
                  }}
                />
              )}
              {(activeTab === 'measurements' || activeTab === 'measure' || activeTab === 'client-measurements') && (
                <MeasurementsSection
                  profiles={profiles}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === 'addresses' && <AddressSection />}
              {activeTab === 'support' && <SupportSection activeRole={activeRole} />}
              {(activeTab === 'delivery' || activeTab.startsWith('delivery-') || activeTab === 'tailor-delivery') && <DeliverySection jobs={deliveryJobs} activeTab={activeTab} />}
              {(activeTab === 'admin' || activeTab.startsWith('admin-')) && adminMetrics && (
                <AdminSection metrics={adminMetrics} onRefreshMetrics={reloadAdminMetrics} activeTab={activeTab} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Cart Side Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onCheckout={handleCheckout}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        order={paymentModalOrder}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentModalOrder(null);
        }}
        onPaymentSuccess={async () => {
          if (paymentModalOrder) {
            await updateOrderStatus(
              paymentModalOrder.orderId,
              'PAID',
              'SYSTEM',
              'Payment verified via gateway'
            );
            // Refresh orders to reflect the PAID state in the UI immediately
            const updated = await fetchOrders();
            setOrders(updated);
          }
          setIsPaymentModalOpen(false);
          setPaymentModalOrder(null);
          showToast('success', 'Payment Received', 'Transaction processed successfully');
          await loadFavoritesAndCart();
        }}
      />

      {/* Customer Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        order={reviewModalOrder}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewModalOrder(null);
        }}
        onReviewSubmitted={async () => {
          setIsReviewModalOpen(false);
          setReviewModalOrder(null);
          showToast('success', 'Review Published', 'Thank you for your rating & feedback!');
          await loadFavoritesAndCart();
        }}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUpdateCount={(count) => setUnreadNotifications(count)}
      />

      {/* User Registration & Login Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setActiveRole(user.role);
          if (user.role === 'CUSTOMER') setActiveTab('customer-dashboard');
          else if (user.role === 'TAILOR') setActiveTab('tailor-dashboard');
          else if (user.role === 'ADMIN') setActiveTab('admin');
          showToast('success', 'Authentication Successful', `Welcome back, ${user.name}! Switched role to ${user.role}.`);
        }}
      />

      {/* Global Toast Notification Banners */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Global Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <footer
        style={{
          background: 'rgba(8, 12, 20, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '32px 0',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#64748b',
        }}
      >
        <div className="container">
          <p>© 2026 SEWFIT Platform • Measure. Customize. Wear.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
