package com.example.demo.admin.service;

import com.example.demo.admin.dto.AdminDashboardResponse;
import com.example.demo.admin.dto.TopItemStat;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.OrderStatus;
import com.example.demo.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminDashboardService {

    private final OrderRepository orderRepository;

    public AdminDashboardService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public AdminDashboardResponse getTodayStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        List<Order> orders = orderRepository.findByOrderDateBetween(start, end);

        long orderCount = orders.size();
        long revenue = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELED)
                .mapToLong(o -> o.getTotalPrice() == null ? 0 : o.getTotalPrice())
                .sum();

        Map<String, Long> counter = new HashMap<>();
        for (Order order : orders) {
            if (order.getItems() == null) continue;
            for (OrderItem item : order.getItems()) {
                String key = item.getName() == null ? "Unknown" : item.getName();
                counter.put(key, counter.getOrDefault(key, 0L) + 1);
            }
        }

        List<TopItemStat> topItems = counter.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .map(e -> new TopItemStat(e.getKey(), e.getValue()))
                .toList();

        return new AdminDashboardResponse(orderCount, revenue, topItems);
    }
}
