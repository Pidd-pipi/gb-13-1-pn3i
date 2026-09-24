<template>
  <div class="page-container">
    <van-nav-bar title="浏览足迹" left-arrow @click-left="router.back">
      <template #right>
        <span v-if="items.length > 0" class="clear-entry" @click="handleClear">清空</span>
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="loading-center" />

    <template v-else>
      <div v-if="items.length > 0" class="history-tip">
        最近浏览的 {{ items.length }} 本书，最多保留 50 本
      </div>

      <div v-if="items.length > 0" class="history-list">
        <van-swipe-cell v-for="item in items" :key="item.id">
          <BookCard :book="item.book" @click="goDetail(item.book.id)" />
          <template #right>
            <van-button square type="danger" text="移除" class="remove-btn" @click="handleRemove(item)" />
          </template>
        </van-swipe-cell>
      </div>

      <van-empty v-else description="还没有浏览记录，去逛逛吧">
        <van-button type="primary" @click="router.push('/home')">去首页</van-button>
      </van-empty>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import BookCard from '@/components/BookCard.vue';
import {
  getBrowsingHistory,
  removeBrowsingHistory,
  clearBrowsingHistory,
  type BrowsingHistoryItem,
} from '@/api/history';

const router = useRouter();
const loading = ref(true);
const items = ref<BrowsingHistoryItem[]>([]);

const fetchHistory = async () => {
  loading.value = true;
  try {
    items.value = await getBrowsingHistory();
  } finally {
    loading.value = false;
  }
};

const goDetail = (bookId: string) => {
  router.push(`/book/${bookId}`);
};

const handleRemove = async (item: BrowsingHistoryItem) => {
  // 先从列表移除，接口失败再回滚
  const index = items.value.findIndex(i => i.id === item.id);
  if (index === -1) return;

  const [removed] = items.value.splice(index, 1);
  try {
    await removeBrowsingHistory(item.book.id);
    showToast('已移除');
  } catch {
    items.value.splice(index, 0, removed);
  }
};

const handleClear = async () => {
  try {
    await showConfirmDialog({
      title: '清空浏览足迹',
      message: '将清空全部浏览记录，确定继续吗？',
      confirmButtonText: '清空',
    });
  } catch {
    return;
  }

  items.value = [];
  try {
    await clearBrowsingHistory();
    showToast('已清空');
  } catch {
    fetchHistory();
  }
};

onMounted(fetchHistory);
</script>

<style scoped>
.loading-center {
  display: flex;
  justify-content: center;
  padding: 100px;
}
.clear-entry {
  color: #646566;
  font-size: 14px;
}
.history-tip {
  padding: 8px 16px;
  font-size: 12px;
  color: #969799;
}
.history-list {
  padding: 0 12px 12px;
}
.remove-btn {
  height: 100%;
}
</style>
