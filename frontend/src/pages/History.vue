<template>
  <div class="page-container">
    <van-nav-bar title="浏览足迹" left-arrow @click-left="router.back">
      <template #right>
        <span v-if="histories.length > 0" class="clear-btn" @click="clearAll">清空</span>
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="loading-center" />

    <div v-else-if="histories.length > 0" class="history-list">
      <van-swipe-cell v-for="item in histories" :key="item.id">
        <div class="history-item">
          <BookCard :book="item.book" @click="router.push(`/book/${item.book.id}`)" />
          <div class="viewed-at">浏览于 {{ formatTime(item.viewedAt) }}</div>
        </div>
        <template #right>
          <van-button
            square
            type="danger"
            text="删除"
            class="delete-btn"
            @click="removeOne(item)"
          />
        </template>
      </van-swipe-cell>
    </div>

    <van-empty v-else description="暂无浏览足迹" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { getBrowsingHistory, removeBrowsingHistory, clearBrowsingHistory } from '@/api/book';
import BookCard from '@/components/BookCard.vue';
import type { BrowsingHistoryItem } from '@/types';

const router = useRouter();
const loading = ref(true);
const histories = ref<BrowsingHistoryItem[]>([]);

const fetchHistory = async () => {
  loading.value = true;
  try {
    histories.value = await getBrowsingHistory();
  } finally {
    loading.value = false;
  }
};

const formatTime = (time: string) => {
  const date = new Date(time);
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const removeOne = async (item: BrowsingHistoryItem) => {
  try {
    await removeBrowsingHistory(item.bookId);
    histories.value = histories.value.filter(h => h.id !== item.id);
    showToast('已移除');
  } catch {}
};

const clearAll = async () => {
  try {
    await showConfirmDialog({
      title: '清空足迹',
      message: '确定要清空全部浏览足迹吗？',
    });
  } catch {
    return;
  }
  try {
    await clearBrowsingHistory();
    histories.value = [];
    showToast('已清空');
  } catch {}
};

onMounted(fetchHistory);
</script>

<style scoped>
.loading-center {
  display: flex;
  justify-content: center;
  padding: 100px;
}
.clear-btn {
  color: #1989fa;
  font-size: 14px;
}
.history-list {
  padding-top: 12px;
}
.history-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}
.history-item :deep(.book-card) {
  margin-bottom: 0;
  border-radius: 0;
}
.viewed-at {
  padding: 6px 12px;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #f5f5f5;
}
.delete-btn {
  height: 100%;
}
</style>
