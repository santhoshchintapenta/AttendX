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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { getStudents } from '../../services/studentApi';
import { useFocusEffect } from '@react-navigation/native';

// Avatar with initials from student full name
const Avatar = ({ name }) => {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';
  // Deterministic colour from name length
  const colours = ['#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706'];
  const bg = colours[name?.length % colours.length] || colours[0];
  return (
    <View style={[styles.avatar, { backgroundColor: bg }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
};

const StudentRow = ({ student }) => {
  const sectionLabel = student.section?.sectionName
    ? `Y${student.year} S${student.semester} · ${student.section.sectionName}`
    : `Year ${student.year} · Sem ${student.semester}`;

  return (
    <View style={styles.row}>
      <Avatar name={student.fullName} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>{student.fullName}</Text>
        <Text style={styles.rowRoll}>{student.rollNumber}</Text>
      </View>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{sectionLabel}</Text>
      </View>
    </View>
  );
};

const StudentsScreen = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getStudents();
      setStudents(data);
      setFiltered(data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Unable to load students. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [])
  );

  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setFiltered(students);
      return;
    }
    const q = text.toLowerCase();
    setFiltered(
      students.filter(
        s =>
          s.fullName?.toLowerCase().includes(q) ||
          s.rollNumber?.toLowerCase().includes(q)
      )
    );
  };

  const handleClear = () => {
    setSearch('');
    setFiltered(students);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Students</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading students…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Students</Text>
        </View>
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Feather name="wifi-off" size={28} color={theme.colors.error} />
          </View>
          <Text style={styles.errorTitle}>Couldn't load students</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchStudents()}>
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
          <Text style={styles.pageTitle}>Students</Text>
          <Text style={styles.pageSubtitle}>
            {students.length} {students.length === 1 ? 'student' : 'students'} enrolled
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or roll number…"
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={handleSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Feather name="x" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Feather name="users" size={28} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>
            {search ? 'No results found' : 'No students yet'}
          </Text>
          <Text style={styles.emptyMsg}>
            {search
              ? `No students match "${search}"`
              : 'Students will appear here once they are enrolled in your department.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => <StudentRow student={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchStudents(true)}
              tintColor={theme.colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  pageTitle: {
    ...theme.typography.h2,
    marginBottom: 2,
  },
  pageSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.button,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    padding: 0,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: theme.radius.card,
    ...theme.shadows.subtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 56,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rowInfo: {
    flex: 1,
    marginRight: 8,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  rowRoll: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  sectionBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMsg: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: theme.radius.button,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMsg: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StudentsScreen;
