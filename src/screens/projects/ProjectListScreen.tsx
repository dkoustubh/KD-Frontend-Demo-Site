import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInUp, FadeIn, ZoomIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { mockProjects } from '../../mock/projects';
import { MagnifyingGlass, Plus, MapPin, CalendarBlank, Users, X, ChartLineUp, CheckSquare } from 'phosphor-react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const { width, height } = Dimensions.get('window');

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Ongoing': return colors.secondary;
    case 'Completed': return colors.accent;
    case 'Delayed': return colors.error;
    default: return colors.primary;
  }
};

const ProjectCard = ({ project, index, onPress }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const onPressIn = () => { scale.value = withSpring(0.95); };
  const onPressOut = () => { scale.value = withSpring(1); };

  return (
    <AnimatedTouchable 
      entering={FadeInUp.delay(index * 100).springify()}
      style={[styles.card, animatedStyle]}
      activeOpacity={0.9}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onPress(project)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>{project.logo}</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(project.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>{project.status}</Text>
        </View>
      </View>

      <Text style={styles.projectName}>{project.name}</Text>
      <Text style={styles.projectId}>ID: {project.id}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${project.progress}%`, backgroundColor: getStatusColor(project.status) }]} />
        </View>
        <Text style={styles.progressText}>{project.progress}%</Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>{project.location}</Text>
        </View>
        <View style={styles.infoItem}>
          <CalendarBlank size={14} color={colors.textSecondary} weight="bold" />
          <Text style={styles.infoText}>{project.endDate}</Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

export const ProjectListScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Members');

  const filteredProjects = mockProjects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = ['Members', 'Tasks', 'Milestones', 'Progress', 'Site Info', 'Activity'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MagnifyingGlass size={20} color={colors.textSecondary} weight="bold" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalOpen(true)}>
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => <ProjectCard project={item} index={index} onPress={setSelectedProject} />}
      />

      {/* Project Details Modal */}
      <Modal visible={!!selectedProject} transparent animationType="fade">
        <View style={styles.glassModalOverlay}>
          <Animated.View entering={ZoomIn.springify().damping(15)} style={styles.modalContent}>
            {selectedProject && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={styles.logoContainer}>
                      <Text style={styles.logoText}>{selectedProject.logo}</Text>
                    </View>
                    <View style={{marginLeft: 15}}>
                      <Text style={styles.modalTitle}>{selectedProject.name}</Text>
                      <Text style={styles.modalSubtitle}>{selectedProject.id} • {selectedProject.status}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedProject(null)}>
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContainer}>
                  {tabs.map(tab => (
                    <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.activeTab]}>
                      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <ScrollView style={styles.tabContentScroll}>
                  {activeTab === 'Members' && (
                    <View>
                      <Text style={styles.tabContentTitle}>Project Members</Text>
                      {selectedProject.members.length > 0 ? (
                        <Text style={styles.mockContentText}>{selectedProject.members.join(', ')} assigned.</Text>
                      ) : (
                        <Text style={styles.mockContentText}>No engineers assigned yet.</Text>
                      )}
                      <TouchableOpacity style={styles.assignBtn}><Text style={styles.assignBtnText}>+ Add Member</Text></TouchableOpacity>
                    </View>
                  )}
                  {activeTab === 'Tasks' && (
                    <View>
                      <Text style={styles.tabContentTitle}>Assign New Task</Text>
                      <TextInput style={styles.taskInput} placeholder="Task Title..." placeholderTextColor={colors.textSecondary} />
                      <TextInput style={[styles.taskInput, {height: 80, marginTop: 10}]} placeholder="Description..." multiline placeholderTextColor={colors.textSecondary} />
                      <TouchableOpacity style={styles.assignBtn}><Text style={styles.assignBtnText}>Assign Task</Text></TouchableOpacity>
                    </View>
                  )}
                  {activeTab === 'Milestones' && (
                    <View>
                      <Text style={styles.tabContentTitle}>Project Timeline</Text>
                      <View style={styles.timelineItem}>
                        <CheckSquare color={colors.accent} size={20} />
                        <Text style={styles.timelineText}>Phase 1: Design (Completed)</Text>
                      </View>
                      <View style={styles.timelineItem}>
                        <ChartLineUp color={colors.secondary} size={20} weight="bold" />
                        <Text style={styles.timelineText}>Phase 2: Installation (Ongoing)</Text>
                      </View>
                    </View>
                  )}
                  {activeTab === 'Progress' && (
                    <View>
                      <Text style={styles.tabContentTitle}>Detailed Progress</Text>
                      <Text style={styles.mockContentText}>Overall Completion: {selectedProject.progress}%</Text>
                      <Text style={styles.mockContentText}>Estimated Delivery: {selectedProject.endDate}</Text>
                    </View>
                  )}
                  {activeTab === 'Site Info' && (
                    <View>
                      <Text style={styles.tabContentTitle}>Site Details</Text>
                      <Text style={styles.mockContentText}>Location: {selectedProject.location}</Text>
                      <Text style={styles.mockContentText}>GPS Coordinates: 22.6105° N, 75.6791° E</Text>
                    </View>
                  )}
                  {activeTab === 'Activity' && (
                    <View>
                      <Text style={styles.tabContentTitle}>Recent Activity Logs</Text>
                      <Text style={styles.mockContentText}>• Material delivered to site (2 hrs ago)</Text>
                      <Text style={styles.mockContentText}>• Ramesh punched in at site (4 hrs ago)</Text>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Add New Project Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.glassModalOverlay}>
          <Animated.View entering={ZoomIn.springify().damping(15)} style={styles.addModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Project</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.inputLabel}>Project Name</Text>
              <TextInput style={styles.taskInput} placeholder="e.g. Substation Alpha" placeholderTextColor={colors.textSecondary} />
              
              <Text style={styles.inputLabel}>Site Location</Text>
              <TextInput style={styles.taskInput} placeholder="e.g. Sector 5, Industrial Area" placeholderTextColor={colors.textSecondary} />
              
              <Text style={styles.inputLabel}>Estimated End Date</Text>
              <TextInput style={styles.taskInput} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textSecondary} />
              
              <TouchableOpacity style={styles.assignBtn} onPress={() => setIsAddModalOpen(false)}>
                <Text style={styles.assignBtnText}>Create Project</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    gap: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontSize: 16,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: {
    padding: 10,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  projectId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  infoRow: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  glassModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 30, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: width > 600 ? 500 : '100%',
    height: height * 0.7,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  addModalContent: {
    width: width > 600 ? 500 : '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  tabsScroll: {
    maxHeight: 45,
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 10,
    height: 36,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFF',
  },
  tabContentScroll: {
    flex: 1,
  },
  tabContentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  mockContentText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  assignBtn: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  assignBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 15,
  },
  taskInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    color: colors.text,
    fontSize: 15,
  }
});
