<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurposesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $purposes = [
            // Education Category
            [
                'name' => 'Education & Scholarships',
                'slug' => 'education-scholarships',
                'description' => 'Support educational initiatives, scholarships, and learning programs for students in need.',
                'category' => 'Education',
                'icon' => '🎓',
                'sort_order' => 1,
            ],
            [
                'name' => 'School Infrastructure',
                'slug' => 'school-infrastructure',
                'description' => 'Help build and improve school facilities, libraries, and educational infrastructure.',
                'category' => 'Education',
                'icon' => '🏫',
                'sort_order' => 2,
            ],
            [
                'name' => 'Digital Learning',
                'slug' => 'digital-learning',
                'description' => 'Support digital literacy programs and technology access for students.',
                'category' => 'Education',
                'icon' => '💻',
                'sort_order' => 3,
            ],

            // Healthcare Category
            [
                'name' => 'Medical Treatment',
                'slug' => 'medical-treatment',
                'description' => 'Support individuals and families with medical expenses and treatment costs.',
                'category' => 'Healthcare',
                'icon' => '🏥',
                'sort_order' => 4,
            ],
            [
                'name' => 'Healthcare Infrastructure',
                'slug' => 'healthcare-infrastructure',
                'description' => 'Help build and equip hospitals, clinics, and healthcare facilities.',
                'category' => 'Healthcare',
                'icon' => '🚑',
                'sort_order' => 5,
            ],
            [
                'name' => 'Mental Health Support',
                'slug' => 'mental-health-support',
                'description' => 'Support mental health programs, counseling services, and awareness campaigns.',
                'category' => 'Healthcare',
                'icon' => '🧠',
                'sort_order' => 6,
            ],

            // Social Welfare Category
            [
                'name' => 'Poverty Alleviation',
                'slug' => 'poverty-alleviation',
                'description' => 'Help provide basic necessities and support to families and individuals in poverty.',
                'category' => 'Social Welfare',
                'icon' => '🤝',
                'sort_order' => 7,
            ],
            [
                'name' => 'Food Security',
                'slug' => 'food-security',
                'description' => 'Support food banks, meal programs, and nutrition initiatives for the hungry.',
                'category' => 'Social Welfare',
                'icon' => '🍞',
                'sort_order' => 8,
            ],
            [
                'name' => 'Housing & Shelter',
                'slug' => 'housing-shelter',
                'description' => 'Help provide safe housing and shelter for homeless individuals and families.',
                'category' => 'Social Welfare',
                'icon' => '🏠',
                'sort_order' => 9,
            ],

            // Emergency Relief Category
            [
                'name' => 'Disaster Relief',
                'slug' => 'disaster-relief',
                'description' => 'Emergency assistance for natural disasters, floods, earthquakes, and other calamities.',
                'category' => 'Emergency Relief',
                'icon' => '🆘',
                'sort_order' => 10,
            ],
            [
                'name' => 'Emergency Medical Aid',
                'slug' => 'emergency-medical-aid',
                'description' => 'Urgent medical assistance for emergency situations and critical cases.',
                'category' => 'Emergency Relief',
                'icon' => '🚨',
                'sort_order' => 11,
            ],
            [
                'name' => 'Crisis Support',
                'slug' => 'crisis-support',
                'description' => 'Support for families and communities facing unexpected crises.',
                'category' => 'Emergency Relief',
                'icon' => '⛑️',
                'sort_order' => 12,
            ],

            // Environment Category
            [
                'name' => 'Environmental Conservation',
                'slug' => 'environmental-conservation',
                'description' => 'Support conservation efforts, wildlife protection, and environmental sustainability.',
                'category' => 'Environment',
                'icon' => '🌍',
                'sort_order' => 13,
            ],
            [
                'name' => 'Clean Energy Projects',
                'slug' => 'clean-energy-projects',
                'description' => 'Support renewable energy initiatives and sustainable power projects.',
                'category' => 'Environment',
                'icon' => '⚡',
                'sort_order' => 14,
            ],
            [
                'name' => 'Tree Plantation',
                'slug' => 'tree-plantation',
                'description' => 'Support reforestation efforts and tree planting initiatives.',
                'category' => 'Environment',
                'icon' => '🌳',
                'sort_order' => 15,
            ],

            // Community Development Category
            [
                'name' => 'Rural Development',
                'slug' => 'rural-development',
                'description' => 'Support infrastructure and development projects in rural and remote areas.',
                'category' => 'Community Development',
                'icon' => '🚜',
                'sort_order' => 16,
            ],
            [
                'name' => 'Water & Sanitation',
                'slug' => 'water-sanitation',
                'description' => 'Help provide clean water access and sanitation facilities to communities.',
                'category' => 'Community Development',
                'icon' => '💧',
                'sort_order' => 17,
            ],
            [
                'name' => 'Women Empowerment',
                'slug' => 'women-empowerment',
                'description' => 'Support programs that empower women through education, skills, and opportunities.',
                'category' => 'Community Development',
                'icon' => '👩',
                'sort_order' => 18,
            ],

            // Special Causes Category
            [
                'name' => 'Child Welfare',
                'slug' => 'child-welfare',
                'description' => 'Support orphanages, child protection programs, and child development initiatives.',
                'category' => 'Special Causes',
                'icon' => '👶',
                'sort_order' => 19,
            ],
            [
                'name' => 'Elderly Care',
                'slug' => 'elderly-care',
                'description' => 'Support senior citizen care, old age homes, and elderly welfare programs.',
                'category' => 'Special Causes',
                'icon' => '👴',
                'sort_order' => 20,
            ],
            [
                'name' => 'Disability Support',
                'slug' => 'disability-support',
                'description' => 'Support programs for people with disabilities, including accessibility and inclusion.',
                'category' => 'Special Causes',
                'icon' => '♿',
                'sort_order' => 21,
            ],
            [
                'name' => 'Animal Welfare',
                'slug' => 'animal-welfare',
                'description' => 'Support animal rescue, veterinary care, and animal protection initiatives.',
                'category' => 'Special Causes',
                'icon' => '🐕',
                'sort_order' => 22,
            ],

            // Religious & Cultural Category
            [
                'name' => 'Religious Activities',
                'slug' => 'religious-activities',
                'description' => 'Support religious institutions, spiritual programs, and faith-based initiatives.',
                'category' => 'Religious & Cultural',
                'icon' => '🙏',
                'sort_order' => 23,
            ],
            [
                'name' => 'Cultural Preservation',
                'slug' => 'cultural-preservation',
                'description' => 'Support cultural heritage preservation, arts, and traditional practices.',
                'category' => 'Religious & Cultural',
                'icon' => '🎭',
                'sort_order' => 24,
            ],

            // General Category
            [
                'name' => 'General Donation',
                'slug' => 'general-donation',
                'description' => 'General contribution to support various charitable activities and causes.',
                'category' => 'General',
                'icon' => '💝',
                'sort_order' => 25,
            ],
            [
                'name' => 'Community Service',
                'slug' => 'community-service',
                'description' => 'Support local community service projects and volunteer initiatives.',
                'category' => 'General',
                'icon' => '🤲',
                'sort_order' => 26,
            ],
        ];

        foreach ($purposes as $purpose) {
            DB::table('purposes')->insert([
                'id' => Str::uuid(),
                'name' => $purpose['name'],
                'slug' => $purpose['slug'],
                'description' => $purpose['description'],
                'category' => $purpose['category'],
                'icon' => $purpose['icon'],
                'sort_order' => $purpose['sort_order'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Successfully seeded ' . count($purposes) . ' donation purposes across ' . count(array_unique(array_column($purposes, 'category'))) . ' categories.');
    }
}
