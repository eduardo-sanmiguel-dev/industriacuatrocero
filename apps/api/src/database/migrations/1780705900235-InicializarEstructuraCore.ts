import { MigrationInterface, QueryRunner } from "typeorm";

export class InicializarEstructuraCore1780705900235 implements MigrationInterface {
    name = 'InicializarEstructuraCore1780705900235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "core_countries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "country_code" character varying(2) NOT NULL, "name" character varying(100) NOT NULL, "phone_code" character varying(5) NOT NULL, "currency_code" character varying(3) NOT NULL, CONSTRAINT "UQ_ebed2e4e3c101bd0192d899e4b5" UNIQUE ("name"), CONSTRAINT "PK_9074e45b7c98fa89aa3263044a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2a04726c6371212c91121735db" ON "core_countries"  ("country_code") `);
        await queryRunner.query(`CREATE TABLE "core_tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "subdomain" character varying(50) NOT NULL, "name" character varying(150) NOT NULL, "commercial_name" character varying(150), "tax_id" character varying(50) NOT NULL, "timezone" character varying(50) NOT NULL, "currency" character varying(3) NOT NULL, "plan_type" character varying(20) NOT NULL, "country_id" uuid, CONSTRAINT "UQ_39b9f2b4f7b61ad35eafaf6cdba" UNIQUE ("tax_id"), CONSTRAINT "PK_912a10c1e83d1f9c8e98a0d63af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6441a96352094a8ac9d74d5197" ON "core_tenants"  ("subdomain") `);
        await queryRunner.query(`CREATE TABLE "core_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(150), CONSTRAINT "PK_3ce6e3a8629aa4d65c4aed78837" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2e7a3f78f0ba2b7517da06cd20" ON "core_users"  ("tenant_id", "id") `);
        await queryRunner.query(`CREATE TABLE "core_system_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "email" character varying(150) NOT NULL, "password_hash" character varying(255) NOT NULL, "user_id" uuid, CONSTRAINT "REL_9e22b1854842341decd9bf7c17" UNIQUE ("user_id"), CONSTRAINT "PK_f8cf2c8c1d2266e73450f425211" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b6e6de0b11cc2d4e25998e027c" ON "core_system_accounts"  ("tenant_id", "id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ea13ddd74473789c25971e5bda" ON "core_system_accounts"  ("email") `);
        await queryRunner.query(`CREATE TABLE "hcm_areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "created_by" uuid NOT NULL, "updated_by" uuid, "name" character varying(150) NOT NULL, CONSTRAINT "PK_b9dcdcde213b8d35744fdd85e5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_310edd380804f0d2d31636cae0" ON "hcm_areas"  ("tenant_id", "id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2fcffc12d6e56b17a75d86c961" ON "hcm_areas"  ("tenant_id", "name") `);
        await queryRunner.query(`CREATE TABLE "hcm_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "created_by" uuid NOT NULL, "updated_by" uuid, "name" character varying(150) NOT NULL, CONSTRAINT "PK_f0db5101984fa2fdd95c8830cd6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_386e124e1b1004ce75c5df709b" ON "hcm_jobs"  ("tenant_id", "id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_230a061eb98a1aca3c425a2564" ON "hcm_jobs"  ("tenant_id", "name") `);
        await queryRunner.query(`CREATE TABLE "hcm_employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "created_by" uuid NOT NULL, "updated_by" uuid, "employee_code" character varying(50) NOT NULL, "government_id" character varying(50) NOT NULL, "biological_sex" character varying(10) NOT NULL, "hire_date" date NOT NULL, "termination_date" date, "job_id" uuid NOT NULL, "area_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "REL_19fed47c8f00d76282a7933214" UNIQUE ("user_id"), CONSTRAINT "PK_cd47b3ed7a09cb31859d26df169" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_41ea793355745377dc7da374b9" ON "hcm_employees"  ("tenant_id", "id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f56b9c97690d11f6e879c468a4" ON "hcm_employees"  ("tenant_id", "government_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_670788ae859996633ad1304bd5" ON "hcm_employees"  ("tenant_id", "employee_code") `);
        await queryRunner.query(`ALTER TABLE "core_tenants" ADD CONSTRAINT "FK_cc0cdfeb21476c4889eaaab5645" FOREIGN KEY ("country_id") REFERENCES "core_countries"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core_users" ADD CONSTRAINT "FK_c0d0f2dc44bc285be7a97f9531c" FOREIGN KEY ("tenant_id") REFERENCES "core_tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core_system_accounts" ADD CONSTRAINT "FK_9e22b1854842341decd9bf7c17e" FOREIGN KEY ("user_id") REFERENCES "core_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hcm_employees" ADD CONSTRAINT "FK_8d2c616c230b14048db24b0f0de" FOREIGN KEY ("job_id") REFERENCES "hcm_jobs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hcm_employees" ADD CONSTRAINT "FK_a049b1fca144335803c3cde3266" FOREIGN KEY ("area_id") REFERENCES "hcm_areas"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hcm_employees" ADD CONSTRAINT "FK_19fed47c8f00d76282a79332145" FOREIGN KEY ("user_id") REFERENCES "core_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hcm_employees" DROP CONSTRAINT "FK_19fed47c8f00d76282a79332145"`);
        await queryRunner.query(`ALTER TABLE "hcm_employees" DROP CONSTRAINT "FK_a049b1fca144335803c3cde3266"`);
        await queryRunner.query(`ALTER TABLE "hcm_employees" DROP CONSTRAINT "FK_8d2c616c230b14048db24b0f0de"`);
        await queryRunner.query(`ALTER TABLE "core_system_accounts" DROP CONSTRAINT "FK_9e22b1854842341decd9bf7c17e"`);
        await queryRunner.query(`ALTER TABLE "core_users" DROP CONSTRAINT "FK_c0d0f2dc44bc285be7a97f9531c"`);
        await queryRunner.query(`ALTER TABLE "core_tenants" DROP CONSTRAINT "FK_cc0cdfeb21476c4889eaaab5645"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_670788ae859996633ad1304bd5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f56b9c97690d11f6e879c468a4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_41ea793355745377dc7da374b9"`);
        await queryRunner.query(`DROP TABLE "hcm_employees"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_230a061eb98a1aca3c425a2564"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_386e124e1b1004ce75c5df709b"`);
        await queryRunner.query(`DROP TABLE "hcm_jobs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2fcffc12d6e56b17a75d86c961"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_310edd380804f0d2d31636cae0"`);
        await queryRunner.query(`DROP TABLE "hcm_areas"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea13ddd74473789c25971e5bda"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b6e6de0b11cc2d4e25998e027c"`);
        await queryRunner.query(`DROP TABLE "core_system_accounts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2e7a3f78f0ba2b7517da06cd20"`);
        await queryRunner.query(`DROP TABLE "core_users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6441a96352094a8ac9d74d5197"`);
        await queryRunner.query(`DROP TABLE "core_tenants"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2a04726c6371212c91121735db"`);
        await queryRunner.query(`DROP TABLE "core_countries"`);
    }

}
