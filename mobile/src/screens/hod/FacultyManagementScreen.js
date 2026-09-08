import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { getFacultyList } from '../../services/facultyApi';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AddFacultyModal from '../../components/faculty/AddFacultyModal';

// Avatar component exactly matching StudentsScreen style
const Avatar = ({ name }) => {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';
  const colours = ['#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706'];
  const bg = colours[name?.length % colours.length] || colours[0];
  return (
    <View style={[styles.avatar, { backgroundColor: bg }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
};

const FacultyRow = ({ faculty, onPress }) => {
  const roleDisplay = faculty.user?.role === 'HOD' ? '🛡️ HOD' : faculty.user?.role || 'Faculty';
  const isActive = faculty.user?.isActive;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Avatar name={faculty.user?.name} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>{faculty.user?.name}</Text>
        <Text style={styles.rowSubtext}>{faculty.facultyId} · {faculty.designation || 'Faculty'}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <View style={[styles.badge, faculty.user?.role === 'HOD' ? styles.badgeHOD : styles.badgeNormal]}>
          <Text style={[styles.badgeText, faculty.user?.role === 'HOD' && styles.badgeTextHOD]}>{roleDisplay}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isActive ? '#10b981' : '#ef4444' }]} />
      </View>
    </TouchableOpacity>
  );
};

const FacultyManagementScreen = () => {
  const navigation = useNavigation();
  const [faculty, setFaculty] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchFaculty = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getFacultyList();
      setFaculty(data);
      applyFilters(data, search, statusFilter);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Unable to load faculty. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFaculty();
    }, [])
  );

  const applyFilters = (data, searchText, filterValue) => {
    let filteredData = [...data];

    // Status filter
    if (filterValue === 'active') {
      filteredData = filteredData.filter(f => f.user?.isActive === true);
    } else if (filterValue === 'inactive') {
      filteredData = filteredData.filter(f => f.user?.isActive === false);
    }

    // Search text
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filteredData = filteredData.filter(f => 
        f.user?.name?.toLowerCase().includes(q) ||
        f.facultyId?.toLowerCase().includes(q) ||
        f.user?.email?.toLowerCase().includes(q)
      );
    }

    setFiltered(filteredData);
  };

  const handleSearch = (text) => {
    setSearch(text);
    applyFilters(faculty, text, statusFilter);
  };

  const handleFilterToggle = () => {
    const nextFilter = statusFilter === 'all' ? 'active' : statusFilter === 'active' ? 'inactive' : 'all';
    setStatusFilter(nextFilter);
    applyFilters(faculty, search, nextFilter);
  };

  const handleClearSearch = () => {
    setSearch('');
    applyFilters(faculty, '', statusFilter);
  };

  const handleAddPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', '👤 Add Single Faculty', '📁 Bulk Upload Faculty'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) setIsAddModalOpen(true);
          else if (buttonIndex === 2) navigation.navigate('BulkFacultyUpload');
        }
      );
    } else {
      // Android basic fallback or custom bottom sheet. For now, we'll use a direct modal route or custom overlay.
      // Since Android doesn't have ActionSheetIOS, we will navigate to a generic sheet or just show an alert with options.
      // We can use a lightweight custom action sheet, or simply two buttons if it were in a modal.
      // For simplicity in React Native without 3rd party bottom-sheet libraries, we'll trigger single add for now,
      // but ideally we'd implement a custom BottomSheet component. We'll add a simple custom menu overlay later if needed.
      // For now, let's just trigger Single Add directly on Android unless we build a custom ActionSheet component.
      // Actually, let's route to Bulk Upload if they long-press, or build a quick overlay.
      setIsAddModalOpen(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Faculty Management</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading faculty…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Faculty Management</Text>
        </View>
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Feather name="wifi-off" size={28} color={theme.colors.error} />
          </View>
          <Text style={styles.errorTitle}>Couldn't load faculty</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchFaculty()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Faculty Management</Text>
          <Text style={styles.pageSubtitle}>
            Total Faculty: {faculty.length}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddPress}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, ID, or email…"
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={handleSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={{ marginRight: 8 }}>
              <Feather name="x" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={handleFilterToggle}>
          <Feather name="filter" size={18} color={statusFilter !== 'all' ? theme.colors.primary : theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Feather name="user-check" size={28} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>
            {search ? 'No results found' : 'No faculty yet'}
          </Text>
          <Text style={styles.emptyMsg}>
            {search
              ? `No faculty match your criteria.`
              : 'Add faculty members to manage their access and schedules.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <FacultyRow 
              faculty={item} 
              onPress={() => navigation.navigate('FacultyDetails', { id: item._id })} 
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchFaculty(true)}
              tintColor={theme.colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Add Single Faculty Modal Component */}
      <AddFacultyModal 
        visible={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchFaculty();
        }} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  pageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  pageTitle: { fontSize: 24, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: theme.colors.textMuted },
  addBtn: {
    backgroundColor: theme.colors.primary,
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }
  },
  searchWrap: {
    flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 12, alignItems: 'center'
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, height: 44,
  },
  searchIcon: { paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 15, color: theme.colors.text },
  filterBtn: {
    width: 44, height: 44, borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    justifyContent: 'center', alignItems: 'center'
  },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16, borderRadius: theme.borderRadius.lg,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
  rowSubtext: { fontSize: 13, color: theme.colors.textSecondary },
  badge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  badgeNormal: { backgroundColor: '#f1f5f9' },
  badgeHOD: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '500', color: theme.colors.textSecondary },
  badgeTextHOD: { color: theme.colors.primary },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  separator: { height: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: theme.colors.textSecondary },
  errorIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  errorTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
  errorMsg: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  retryBtn: { backgroundColor: theme.colors.surface, paddingHorizontal: 24, paddingVertical: 12, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border },
  retryText: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
  emptyMsg: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});

export default FacultyManagementScreen;
