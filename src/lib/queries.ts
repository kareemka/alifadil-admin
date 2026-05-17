import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
    query GetProducts($category: String, $search: String, $skip: Int, $take: Int, $includeInactive: Boolean) {
        products(category: $category, search: $search, skip: $skip, take: $take, includeInactive: $includeInactive) {
            items {
                id
                name
                price
                discountPercentage
                stock
                isActive
                mainImage
                category {
                    id
                    name
                }
            }
            total
        }
    }
`;

export const GET_CATEGORIES = gql`
    query GetCategories($search: String, $skip: Int, $take: Int) {
        categories(search: $search, skip: $skip, take: $take) {
            items {
                id
                name
                slug
                image
                productsCount
            }
            total
        }
    }
`;

export const GET_COUPONS = gql`
    query GetCoupons($search: String, $skip: Int, $take: Int) {
        coupons(search: $search, skip: $skip, take: $take) {
            items {
                id
                code
                discountType
                discountValue
                expiryDate
                minOrderAmount
                isActive
                createdAt
            }
            total
        }
    }
`;

export const CREATE_COUPON = gql`
    mutation CreateCoupon($input: CreateCouponInput!) {
        createCoupon(input: $input) {
            id
            code
        }
    }
`;

export const UPDATE_COUPON = gql`
    mutation UpdateCoupon($id: ID!, $input: UpdateCouponInput!) {
        updateCoupon(id: $id, input: $input) {
            id
            code
        }
    }
`;

export const DELETE_COUPON = gql`
    mutation DeleteCoupon($id: ID!) {
        deleteCoupon(id: $id)
    }
`;

export const GET_ORDERS = gql`
    query GetOrders($search: String, $skip: Int, $status: OrderStatus, $take: Int) {
        orders(search: $search, skip: $skip, status: $status, take: $take) {
            items {
                id
                orderNumber
                customerName
                customerPhone
                discountAmount
                totalAmount
                status
                createdAt
                items {
                    id
                    price
                    quantity
                    product {
                        id
                        name
                        price
                        discountPercentage
                    }
                }
            }
            total
        }
    }
`;

export const GET_FAQS = gql`
    query GetFaqs($search: String, $skip: Int, $take: Int, $isActive: Boolean) {
        faqs(search: $search, skip: $skip, take: $take, isActive: $isActive) {
            items {
                id
                question
                answer
                order
                isActive
            }
            total
        }
    }
`;

export const GET_MONTHLY_SALES = gql`
    query GetMonthlySales($months: Int) {
        monthlySales(months: $months) {
            month
            totalSales
            orderCount
        }
    }
`;

export const GET_COLORS = gql`
    query GetColors($search: String, $skip: Int, $take: Int) {
        colors(search: $search, skip: $skip, take: $take) {
            items {
                id
                name
                image
            }
            total
        }
    }
`;

