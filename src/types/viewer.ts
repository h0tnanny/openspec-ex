export interface DiscoveryBrief {
  name: string;
  title: string;
  content: string;
}

export interface CommentItem {
  id: string;
  blockId: string;
  tabId: string;
  tabName: string;
  refText: string;
  text: string;
  status: 'open' | 'resolved';
  timestamp: string;
}

export interface SpecViewerData {
  changeId: string;
  exploreMd: string;
  proposalMd: string;
  designMd: string;
  tasksMd: string;
  discoveryFiles: DiscoveryBrief[];
  completedTasks: number;
  totalTasks: number;
  taskPercent: number;
}
