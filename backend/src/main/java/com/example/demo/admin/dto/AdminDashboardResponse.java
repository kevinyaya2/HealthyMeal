package com.example.demo.admin.dto;

import java.util.List;

public record AdminDashboardResponse(
        long todayOrderCount,
        long todayRevenue,
        List<TopItemStat> topItems
) {
}
