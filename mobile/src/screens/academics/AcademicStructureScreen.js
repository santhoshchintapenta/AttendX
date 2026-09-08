import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getDepartments, getSections, getSubjects } from '../../services/academicApi';
import { theme } from '../../theme/theme';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppCard from '../../components/ui/AppCard';
import SectionHeader from '../../components/ui/SectionHeader';
import EmptyState from '../../components/ui/EmptyState';
import { Feather } from '@expo/vector-icons';

const AcademicStructureScreen = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  
  const [myDept, setMyDept] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const depts = await getDepartments();
      const userDept = depts.find(d => d._id === user?.department);
      setMyDept(userDept);
      
      const secs = await getSections();
      setSections(secs);
      
      const subs = await getSubjects();
      setSubjects(subs);
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to load academic information. Please try again.';
      setErrorMsg(message);
      console.error('Academic Structure API Error:', err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Academic Structure</Text>
        <Text style={styles.subtitle}>Manage your department's academic information.</Text>
      </View>

      <SectionHeader title="My Department" />
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      <AppCard style={styles.deptCard}>
        <View style={styles.deptIcon}>
          <Feather name="layers" size={24} color={theme.colors.accent} />
        </View>
        <View style={styles.deptInfo}>
          <Text style={styles.deptName}>{myDept ? myDept.name : 'Not Assigned'}</Text>
          <Text style={styles.deptCode}>{myDept ? myDept.code : '--'}</Text>
        </View>
      </AppCard>

      <SectionHeader title="Sections" />
      {sections.length > 0 ? (
        <AppCard style={styles.listCard}>
          {sections.map((sec, index) => (
            <View key={sec._id} style={[styles.listItem, index === sections.length - 1 && styles.lastItem]}>
              <View style={styles.listIconBlue}>
                <Feather name="users" size={16} color={theme.colors.primary} />
              </View>
              <Text style={styles.listText}>
                Year {sec.year}, Sem {sec.semester} — Section {sec.sectionName}
              </Text>
            </View>
          ))}
        </AppCard>
      ) : (
        <EmptyState icon="users" message="No sections" description="No sections exist in this department yet." />
      )}

      <SectionHeader title="Subjects" />
      {subjects.length > 0 ? (
        <AppCard style={styles.listCard}>
          {subjects.map((sub, index) => (
            <View key={sub._id} style={[styles.listItem, index === subjects.length - 1 && styles.lastItem]}>
              <View style={styles.listIconViolet}>
                <Feather name="book" size={16} color={theme.colors.accent} />
              </View>
              <View style={styles.subjectInfo}>
                <Text style={styles.listText}>{sub.subjectName}</Text>
                <Text style={styles.subjectMeta}>{sub.subjectCode} • Y{sub.year} S{sub.semester}</Text>
              </View>
            </View>
          ))}
        </AppCard>
      ) : (
        <EmptyState icon="book" message="No subjects" description="No subjects have been mapped to this department." />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  deptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderColor: theme.colors.softViolet,
    borderWidth: 2,
  },
  deptIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.softViolet,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.l,
  },
  deptInfo: {
    flex: 1,
  },
  deptName: {
    ...theme.typography.h3,
    marginBottom: 4,
  },
  deptCode: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  listCard: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  listIconBlue: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  listIconViolet: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.softViolet,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  listText: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectMeta: {
    ...theme.typography.caption,
    marginTop: 2,
  }
});

export default AcademicStructureScreen;
