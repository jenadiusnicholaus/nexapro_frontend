<template>
  <div class="property-details">
    <!-- Header with property info -->
    <div class="details-header">
      <VaButton preset="plain" icon="arrow_back" @click="goBack">
        Back to Properties
      </VaButton>
      <div v-if="property" class="property-info">
        <div class="property-main-info">
          <img
            v-if="property.image_url"
            :src="property.image_url"
            :alt="property.property_name"
            class="property-image"
          />
          <div v-else class="property-image-placeholder">
            <VaIcon name="home" size="large" />
          </div>
          <div class="property-title-section">
            <div class="title-with-badge">
              <h1 class="property-title">{{ property.property_name }}</h1>
              <VaBadge
                :text="property.is_public ? 'Public' : 'Private'"
                :color="property.is_public ? 'success' : 'warning'"
                class="visibility-badge"
              />
            </div>
            <p class="property-meta">
              <VaIcon name="location_on" size="small" />
              {{ getLocationDisplay(property) }}
            </p>
            <p class="property-meta">
              <VaIcon name="business" size="small" />
              {{ getPropertyType(property) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <VaCard>
      <VaCardContent>
        <VaTabs v-model="activeTab" class="property-tabs">
          <template #tabs>
            <VaTab name="units">
              <VaIcon name="meeting_room" size="small" class="tab-icon" />
              Units
            </VaTab>
            <VaTab name="tenancies">
              <VaIcon name="description" size="small" class="tab-icon" />
              Tenancies
            </VaTab>
            <VaTab name="tenants">
              <VaIcon name="people" size="small" class="tab-icon" />
              Tenants
            </VaTab>
          </template>
        </VaTabs>

        <!-- Units Tab -->
        <div v-if="activeTab === 'units'" class="tab-content">
          <div class="tab-header">
            <h2>Units</h2>
            <div class="tab-actions">
              <VaSelect
                v-model="unitStatusFilter"
                :options="['all', 'vacant', 'occupied', 'maintenance']"
                text-by="(option) => option === 'all' ? 'All Status' : option.charAt(0).toUpperCase() + option.slice(1)"
                placeholder="Filter by status"
                style="max-width: 200px"
                clearable
              />
              <VaButton @click="showAddUnitModal = true">Add Unit</VaButton>
            </div>
          </div>

          <AppDataTable
            :items="filteredUnits"
            :columns="unitColumns"
            :loading="unitsStore.loading"
          >
            <template #cell(image)="{ rowData }">
              <div class="unit-image-cell">
                <img
                  v-if="rowData.image_url"
                  :src="rowData.image_url"
                  :alt="rowData.unit_number"
                  class="unit-thumbnail"
                />
                <div v-else class="unit-placeholder">
                  <VaIcon name="meeting_room" size="small" />
                </div>
              </div>
            </template>
            <template #cell(status)="{ rowData }">
              <VaChip :color="getStatusColor(rowData.status)">
                {{ rowData.status }}
              </VaChip>
            </template>
            <template #cell(actions)="{ rowData }">
              <VaButton
                preset="plain"
                icon="edit"
                size="small"
                @click="editUnit(rowData)"
              />
              <VaButton
                preset="plain"
                icon="delete"
                size="small"
                color="danger"
                @click="deleteUnit(Number(rowData.id))"
              />
            </template>
          </AppDataTable>
        </div>

        <!-- Tenancies Tab -->
        <div v-if="activeTab === 'tenancies'" class="tab-content">
          <div class="tab-header">
            <h2>Tenancies</h2>
            <VaButton @click="openAddTenancyModal">Add Tenancy</VaButton>
          </div>

          <AppDataTable
            :items="propertyTenancies"
            :columns="tenancyColumns"
            :loading="tenanciesStore.loading"
          >
            <template #cell(status)="{ rowData }">
              <VaChip :color="getTenancyStatusColor(rowData.status)">
                {{ rowData.status }}
              </VaChip>
            </template>
            <template #cell(actions)="{ rowData }">
              <VaDropdown placement="bottom-end" :offset="[0, 10]">
                <template #anchor>
                  <VaButton icon="more_vert" preset="secondary" />
                </template>
                <VaDropdownContent>
                  <div class="dropdown-actions-list">
                    <VaButton
                      preset="plain"
                      icon="visibility"
                      size="small"
                      class="dropdown-action-item"
                      @click="viewTenancyDetails(rowData)"
                    >
                      View Details
                    </VaButton>
                    <VaButton
                      preset="plain"
                      icon="edit"
                      size="small"
                      class="dropdown-action-item"
                      color="info"
                      @click="openUpdateModal(rowData)"
                    >
                      Update Tenancy / Duration
                    </VaButton>
                    <VaButton
                      preset="plain"
                      icon="description"
                      size="small"
                      class="dropdown-action-item"
                      @click="generateContract(rowData)"
                      :loading="generatingContractId === rowData.id"
                    >
                      Contract
                    </VaButton>
                    <VaButton
                      v-if="isTenancyDueDate(rowData)"
                      preset="plain"
                      icon="sms"
                      size="small"
                      class="dropdown-action-item"
                      @click="sendReminder(rowData)"
                      :loading="sendingReminderId === rowData.id"
                    >
                      Send SMS
                    </VaButton>
                    <VaButton
                      v-if="!rowData.deposit_paid"
                      preset="plain"
                      icon="account_balance_wallet"
                      size="small"
                      class="dropdown-action-item"
                      @click="openConfirmDepositModal(rowData)"
                    >
                      Confirm Deposit
                    </VaButton>
                    <VaButton
                      v-if="rowData.status === 'active'"
                      preset="plain"
                      icon="logout"
                      size="small"
                      class="dropdown-action-item"
                      color="danger"
                      @click="moveOutTenancy(rowData)"
                    >
                      Move Out
                    </VaButton>
                  </div>
                </VaDropdownContent>
              </VaDropdown>
            </template>
          </AppDataTable>
        </div>

        <!-- Tenants Tab -->
        <div v-if="activeTab === 'tenants'" class="tab-content">
          <div class="tab-header">
            <h2>Tenants</h2>
          </div>

          <AppDataTable
            :items="propertyTenants"
            :columns="tenantColumns"
            :loading="tenantsStore.loading"
          >
            <template #cell(current_unit)="{ rowData }">
              {{ getTenantCurrentUnit(rowData.id) }}
            </template>
            <template #cell(actions)="{ rowData }">
              <VaButton
                preset="plain"
                icon="visibility"
                size="small"
                @click="viewTenant(rowData)"
              >
                View
              </VaButton>
            </template>
          </AppDataTable>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Add Tenancy Modal -->
    <VaModal
      v-model="showAddTenancyModal"
      title="Add Tenancy"
      size="medium"
      hide-default-actions
    >
      <VaForm ref="tenancyForm" @submit.prevent="saveTenancy">
        <div class="tenant-select-group mb-4">
          <VaSelect
            v-model="tenancyFormData.tenant"
            label="Tenant"
            :options="tenantOptions"
            text-by="text"
            value-by="value"
            :rules="[(v) => !!v || 'Tenant is required']"
            placeholder="Select a tenant"
            searchable
            clearable
          />
          <VaButton
            preset="primary"
            icon="add"
            size="small"
            class="add-tenant-btn"
            @click="openAddTenantModal"
          >
            Add New
          </VaButton>
        </div>
        <VaSelect
          v-model="tenancyFormData.unit"
          label="Unit"
          :options="availableUnitOptions"
          text-by="text"
          value-by="value"
          :rules="[(v) => !!v || 'Unit is required']"
          class="mb-4"
        />
        <VaInput
          v-model="tenancyFormData.move_in_date"
          label="Move-In Date"
          type="date"
          :rules="[(v) => !!v || 'Move-in date is required']"
          class="mb-4"
        />

        <div class="row mb-4">
          <div class="flex md4">
            <VaInput
              v-model="tenancyFormData.rent_amount"
              :label="`Rent Amount (per ${tenancyFormData.rent_period})`"
              type="number"
              :rules="[(v) => !!v || 'Rent amount is required']"
            />
          </div>
          <div class="flex md4">
            <VaSelect
              v-model="tenancyFormData.rent_period"
              label="Rent Period"
              :options="[
                { value: 'month', text: 'Per Month' },
                { value: 'day', text: 'Per Day' },
              ]"
              text-by="text"
              value-by="value"
            />
          </div>
          <div class="flex md4">
            <VaSelect
              v-model="tenancyFormData.currency"
              label="Currency"
              :options="['TZS', 'USD', 'EUR']"
            />
          </div>
        </div>

        <div class="row mb-4">
          <div class="flex md6">
            <VaInput
              v-model="tenancyFormData.stay_duration_value"
              label="Stay Duration"
              type="number"
              :rules="[(v) => !!v || 'Duration is required']"
              :placeholder="
                tenancyFormData.stay_duration_unit === 'month'
                  ? 'e.g. 6'
                  : 'e.g. 30'
              "
            />
          </div>
          <div class="flex md6">
            <VaSelect
              v-model="tenancyFormData.stay_duration_unit"
              label="Duration Unit"
              :options="[
                { value: 'month', text: 'Months' },
                { value: 'day', text: 'Days' },
              ]"
              text-by="text"
              value-by="value"
            />
          </div>
        </div>
        <div class="mb-4">
          <VaInput
            v-model="tenancyFormData.deposit_amount"
            label="Deposit Amount"
            type="number"
            :rules="[(v) => !!v || 'Deposit amount is required']"
            class="mb-4"
          />

          <VaCheckbox
            v-model="tenancyFormData.deposit_paid"
            label="Confirm payment received"
            class="mb-3"
          />



          <VaSelect
            v-if="tenancyFormData.deposit_paid"
            v-model="tenancyFormData.deposit_payment_method"
            label="Payment Method"
            :options="[
              { value: 'cash', text: 'Cash' },
              { value: 'bank', text: 'Bank Transfer' },
              {
                value: 'mobile_money',
                text: 'Mobile Money (M-Pesa/Airtel/Tigo)',
              },
              { value: 'cheque', text: 'Cheque' },
              { value: 'other', text: 'Other' },
            ]"
            text-by="text"
            value-by="value"
            :rules="[
              (v) =>
                !!v || 'Payment method is required when payment is confirmed',
            ]"
            placeholder="Select payment method"
          />
        </div>

        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeTenancyModal">Cancel</VaButton>
          <VaButton type="submit" :loading="saving">Save</VaButton>
        </div>
      </VaForm>
    </VaModal>

    <!-- Add Tenant Modal (Independent) -->
    <VaModal
      v-model="showAddTenantModal"
      title="Add New Tenant"
      size="small"
      hide-default-actions
    >
      <VaForm ref="tenantForm" @submit.prevent="createNewTenant">
        <VaInput
          v-model="newTenantData.full_name"
          label="Full Name"
          :rules="[(v) => !!v || 'Name is required']"
          placeholder="Enter full name"
          class="mb-4"
        />
        <VaInput
          v-model="newTenantData.id_number"
          label="ID Number"
          :rules="[(v) => !!v || 'ID number is required']"
          placeholder="Enter ID/Passport number"
          class="mb-4"
        />
        <VaInput
          v-model="newTenantData.email"
          label="Email"
          type="email"
          :rules="[
            (v) => !!v || 'Email is required',
            (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
          ]"
          placeholder="tenant@example.com"
          class="mb-4"
        />
        <PhoneInput
          v-model="newTenantData.phone"
          label="Phone"
          :required="true"
          class="mb-4"
        />
        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeAddTenantModal">Cancel</VaButton>
          <VaButton type="submit" :loading="creatingTenant">Create Tenant</VaButton>
        </div>
      </VaForm>
    </VaModal>

    <!-- Add Unit Modal -->
    <VaModal v-model="showAddUnitModal" title="Add Unit" size="medium">
      <VaForm ref="unitForm" @submit.prevent="saveUnit">
        <VaInput
          v-model="unitFormData.unit_number"
          label="Unit Number"
          :rules="[(v) => !!v || 'Unit number is required']"
          class="mb-4"
        />
        <VaInput v-model="unitFormData.floor" label="Floor" class="mb-4" />
        <VaSelect
          v-model="unitFormData.unit_type"
          label="Unit Type"
          :options="['apartment', 'studio', 'office']"
          :rules="[(v) => !!v || 'Unit type is required']"
          class="mb-4"
        />
        <VaInput
          v-model="unitFormData.rent_amount"
          label="Rent Amount"
          type="number"
          :rules="[(v) => !!v || 'Rent amount is required']"
          class="mb-4"
        />
        <VaSelect
          v-model="unitFormData.status"
          label="Status"
          :options="['vacant', 'occupied', 'maintenance']"
          :rules="[(v) => !!v || 'Status is required']"
          class="mb-4"
        />

        <!-- Image Upload -->
        <div class="mb-4">
          <label class="va-input-label">Unit Image</label>
          <div class="image-upload-container">
            <div v-if="unitImagePreview" class="image-preview">
              <img :src="unitImagePreview" alt="Preview" />
              <VaButton
                preset="plain"
                icon="close"
                size="small"
                color="danger"
                class="remove-image-btn"
                @click="removeUnitImage"
              />
            </div>
            <div v-else class="image-upload-placeholder">
              <VaIcon name="add_photo_alternate" size="large" />
              <p>Click to upload image</p>
            </div>
            <input
              type="file"
              ref="unitImageInput"
              accept="image/*"
              @change="handleUnitImageSelect"
              class="image-input"
            />
          </div>
        </div>

        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeUnitModal">Cancel</VaButton>
          <VaButton type="submit" :loading="savingUnit">Save</VaButton>
        </div>
      </VaForm>
    </VaModal>

    <!-- Move Out Modal -->
    <VaModal v-model="showMoveOutModal" title="Move Out Tenant" size="small">
      <VaForm ref="moveOutForm" @submit.prevent="confirmMoveOut">
        <p class="mb-4">
          Moving out tenant from
          <strong>{{ selectedTenancyForMoveOut?.unit_number }}</strong>
        </p>
        <VaInput
          v-model="moveOutDate"
          label="Move-Out Date"
          type="date"
          :rules="[(v) => !!v || 'Move-out date is required']"
          class="mb-4"
        />
        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeMoveOutModal">Cancel</VaButton>
          <VaButton type="submit" :loading="movingOut">Move Out</VaButton>
        </div>
      </VaForm>
    </VaModal>

    <!-- Tenancy Details Modal -->
    <VaModal
      v-model="showTenancyDetailsModal"
      title="Tenancy Details"
      size="medium"
      hide-default-actions
    >
        <VaAlert
          v-if="!selectedTenancyForView.deposit_paid"
          color="warning"
          icon="warning"
          class="mb-4"
        >
          <strong>Reservation Mode:</strong> Awaiting deposit confirmation. SMS reminder sent to tenant.
        </VaAlert>
        <div class="tenancy-premium-header">
          <div class="tenant-avatar-large">
            {{ selectedTenancyForView.tenant_name?.charAt(0) || 'T' }}
          </div>
          <div class="tenant-info-main">
            <h3>{{ selectedTenancyForView.tenant_name }}</h3>
            <VaBadge
              :color="getTenancyStatusColor(selectedTenancyForView.status)"
              class="status-badge-premium"
            >
              {{ selectedTenancyForView.status.toUpperCase() }}
            </VaBadge>
          </div>
        </div>

        <div class="premium-detail-grid">
          <div class="premium-detail-card">
            <div class="card-icon"><VaIcon name="meeting_room" color="#10b981" /></div>
            <div class="card-content">
              <label>Unit</label>
              <p>{{ selectedTenancyForView.unit_number }}</p>
            </div>
          </div>

          <div class="premium-detail-card">
            <div class="card-icon"><VaIcon name="event" color="#3b82f6" /></div>
            <div class="card-content">
              <label>Move-In Date</label>
              <p>{{ selectedTenancyForView.move_in_date }}</p>
            </div>
          </div>

          <div class="premium-detail-card">
            <div class="card-icon"><VaIcon name="payments" color="#22c55e" /></div>
            <div class="card-content">
              <label>Rent Amount</label>
              <p>
                {{ selectedTenancyForView.currency || "TZS" }}
                {{ Number(selectedTenancyForView.rent_amount).toLocaleString() }}
                <span class="period">/ {{ selectedTenancyForView.rent_period }}</span>
              </p>
            </div>
          </div>

          <div class="premium-detail-card">
            <div class="card-icon"><VaIcon name="account_balance_wallet" color="#f59e0b" /></div>
            <div class="card-content">
              <label>Deposit</label>
              <p>
                {{ selectedTenancyForView.currency || "TZS" }}
                {{ Number(selectedTenancyForView.deposit_amount || 0).toLocaleString() }}
              </p>
            </div>
          </div>

          <div class="premium-detail-card full-width">
            <div class="card-icon"><VaIcon name="calendar_month" color="#8b5cf6" /></div>
            <div class="card-content flex-row">
              <div class="date-item">
                <label>Contract Start</label>
                <p>{{ selectedTenancyForView.contract_start || "N/A" }}</p>
              </div>
              <div class="date-divider"></div>
              <div class="date-item">
                <label>Contract End</label>
                <p>{{ selectedTenancyForView.contract_end || "N/A" }}</p>
              </div>
              <div class="date-divider"></div>
              <div class="date-item">
                <label>Duration</label>
                <p>
                  <span v-if="selectedTenancyForView.stay_duration_value">
                    {{ selectedTenancyForView.stay_duration_value }} {{ selectedTenancyForView.stay_duration_unit || "months" }}
                  </span>
                  <span v-else>N/A</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions-premium mt-6">
          <VaButton
            preset="primary"
            icon="download"
            class="premium-btn shadow-sm"
            @click="downloadUnsignedContract(selectedTenancyForView)"
            :loading="generatingContractId === selectedTenancyForView.id"
          >
            Unsigned Contract
          </VaButton>
          <VaButton
            v-if="!selectedTenancyForView.deposit_paid"
            preset="primary"
            icon="account_balance_wallet"
            color="warning"
            class="premium-btn shadow-sm"
            @click="openConfirmDepositModal(selectedTenancyForView)"
          >
            Confirm Deposit
          </VaButton>
          <VaButton preset="secondary" @click="closeTenancyDetailsModal" class="premium-btn">
            Close
          </VaButton>
        </div>
      </VaModal>

    <!-- Signature Upload Modal -->
    <VaModal
      v-model="showSignatureModal"
      title="Upload Signatures"
      hide-default-actions
      size="large"
    >
      <div class="signature-premium-container">
        <div class="signature-header-info">
          <VaIcon name="draw" size="44px" color="#10b981" />
          <div class="info-text">
            <h3>Contract Digital Signatures</h3>
            <p>Upload signatures and stamps to include in the generated tenancy contract.</p>
          </div>
        </div>

        <div class="signature-sections-grid">
          <!-- Owner Section -->
          <div class="signature-card">
            <div class="card-badge owner">LANDLORD / OWNER</div>
            <div class="signature-upload-areas">
              <div class="upload-box-premium">
                <label>Signature</label>
                <div class="upload-zone" @click="ownerSignatureInput?.click()">
                  <div v-if="ownerSignaturePreview" class="preview">
                    <img :src="ownerSignaturePreview" />
                  </div>
                  <div v-else class="placeholder">
                    <VaIcon name="upload" />
                    <span>Click to upload</span>
                  </div>
                </div>
                <input type="file" ref="ownerSignatureInput" accept="image/*" @change="handleOwnerSignatureSelect" hidden />
              </div>

              <div class="upload-box-premium">
                <label>Stamp (Optional)</label>
                <div class="upload-zone" @click="ownerStampInput?.click()">
                  <div v-if="ownerStampPreview" class="preview">
                    <img :src="ownerStampPreview" />
                  </div>
                  <div v-else class="placeholder">
                    <VaIcon name="upload" />
                    <span>Click to upload</span>
                  </div>
                </div>
                <input type="file" ref="ownerStampInput" accept="image/*" @change="handleOwnerStampSelect" hidden />
              </div>
            </div>
          </div>

          <!-- Tenant Section -->
          <div class="signature-card">
            <div class="card-badge tenant">TENANT</div>
            <div class="signature-upload-areas single">
              <div class="upload-box-premium">
                <label>Signature</label>
                <div class="upload-zone" @click="tenantSignatureInput?.click()">
                  <div v-if="tenantSignaturePreview" class="preview">
                    <img :src="tenantSignaturePreview" />
                  </div>
                  <div v-else class="placeholder">
                    <VaIcon name="upload" />
                    <span>Click to upload</span>
                  </div>
                </div>
                <input type="file" ref="tenantSignatureInput" accept="image/*" @change="handleTenantSignatureSelect" hidden />
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions-premium mt-8">
          <VaButton
            preset="primary"
            icon="download"
            class="premium-btn shadow-sm"
            @click="currentTenancyForContract && downloadUnsignedContract(currentTenancyForContract)"
            :loading="generatingContractId === currentTenancyForContract?.id"
          >
            Unsigned Contract
          </VaButton>
          <div class="flex-grow"></div>
          <VaButton preset="secondary" @click="closeSignatureModal" class="premium-btn">
            Cancel
          </VaButton>
          <VaButton
            @click="uploadSignatures"
            :loading="uploadingSignatures"
            class="premium-btn primary-gradient"
            icon="auto_awesome"
          >
            Finalize & Generate
          </VaButton>
        </div>
      </div>
    </VaModal>

    <!-- SMS Confirmation Modal -->
    <VaModal
      v-model="showSmsModal"
      title="Send Rent Reminder SMS"
      hide-default-actions
      size="medium"
    >
      <div class="sms-modal-container">
        <p class="mb-4">
          Select who should receive the rent reminder SMS for
          <strong>{{ currentTenancyForSms?.tenant_name }}</strong>:
        </p>

        <div class="recipient-selection mb-4">
          <VaCheckbox
            v-model="smsRecipients.sendToTenant"
            label="Send to Tenant"
            class="mb-3"
          >
            <template #label>
              <div>
                <strong>Send to Tenant</strong>
                <p class="recipient-info">
                  {{ currentTenancyForSms?.tenant_name }}
                </p>
              </div>
            </template>
          </VaCheckbox>

          <VaCheckbox v-model="smsRecipients.sendToOwner" label="Send to Owner">
            <template #label>
              <div>
                <strong>Send to Property Owner</strong>
                <p class="recipient-info">Notification about reminder sent</p>
              </div>
            </template>
          </VaCheckbox>
        </div>

        <VaAlert
          v-if="!smsRecipients.sendToTenant && !smsRecipients.sendToOwner"
          color="warning"
          class="mb-4"
        >
          Please select at least one recipient
        </VaAlert>

        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeSmsModal">Cancel</VaButton>
          <VaButton
            color="success"
            @click="confirmSendReminder"
            :disabled="
              !smsRecipients.sendToTenant && !smsRecipients.sendToOwner
            "
            :loading="sendingReminderId !== null"
          >
            Send SMS
          </VaButton>
        </div>
      </div>
    </VaModal>

    <!-- Confirm Deposit Modal -->
    <VaModal
      v-model="showConfirmDepositModal"
      title="Confirm Deposit Payment"
      hide-default-actions
      size="small"
    >
      <VaForm ref="confirmDepositForm" @submit.prevent="confirmDeposit">
        <p class="mb-4">
          Confirming deposit for <strong>{{ currentTenancyForConfirm?.tenant_name }}</strong>.
          This will auto-create a payment record and activate the tenancy billing.
        </p>

        <VaSelect
          v-model="confirmDepositData.deposit_payment_method"
          label="Payment Method"
          :options="[
            { value: 'cash', text: 'Cash' },
            { value: 'bank', text: 'Bank Transfer' },
            { value: 'mobile_money', text: 'Mobile Money (M-Pesa/Airtel/Tigo)' },
            { value: 'cheque', text: 'Cheque' },
            { value: 'other', text: 'Other' },
          ]"
          text-by="text"
          value-by="value"
          :rules="[(v: any) => !!v || 'Required']"
          placeholder="Select payment method"
          class="mb-4"
        />

        <VaInput
          v-model="confirmDepositData.deposit_payment_reference"
          label="Payment Reference (Optional)"
          placeholder="e.g. TXN123456"
          class="mb-4"
        />

        <div class="modal-actions">
          <VaButton preset="secondary" @click="showConfirmDepositModal = false">Cancel</VaButton>
          <VaButton type="submit" :loading="saving">Confirm & Activate</VaButton>
        </div>
      </VaForm>
    </VaModal>
    <!-- Update Tenancy Modal -->
    <VaModal
      v-model="showUpdateModal"
      title="Update Tenancy"
      hide-default-actions
      size="medium"
    >
      <VaForm ref="updateForm" @submit.prevent="saveUpdate">
        <div class="mb-4">
          <p>Update tenancy details for <strong>{{ currentTenancyForUpdate?.tenant_name }}</strong></p>
        </div>

        <VaInput
          v-model="updateData.rent_amount"
          label="Rent Amount"
          type="number"
          :rules="[(v: any) => !!v || 'Required']"
          class="mb-4"
        />

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem" class="mb-4">
          <VaInput
            v-model="updateData.duration_months"
            label="Duration (Months)"
            type="number"
            :rules="[(v: any) => !!v || 'Required']"
          />
          <VaSelect
            v-model="updateData.status"
            label="Status"
            :options="['active', 'completed', 'terminated', 'pending_payment']"
            :rules="[(v: any) => !!v || 'Required']"
          />
        </div>

        <VaInput
          v-model="updateData.move_in_date"
          label="Move-In Date"
          type="date"
          class="mb-4"
        />

        <div class="modal-actions">
          <VaButton preset="secondary" @click="showUpdateModal = false">Cancel</VaButton>
          <VaButton type="submit" :loading="saving">Update Tenancy</VaButton>
        </div>
      </VaForm>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useUnitsStore,
  useTenanciesStore,
  useTenantsStore,
  usePropertiesStore,
} from "@/stores";
import { useAppToast } from "@/composables/useAppToast";
import AppDataTable from "@/components/AppDataTable.vue";
import { buildPayload } from "@/utils/apiPayload";
import { tenanciesAPI, ownersAPI, tenantsAPI } from "@/services/api";
import PhoneInput from "@/components/PhoneInput.vue";

const route = useRoute();
const router = useRouter();
const { success, error } = useAppToast();

const unitsStore = useUnitsStore();
const tenanciesStore = useTenanciesStore();
const tenantsStore = useTenantsStore();
const propertiesStore = usePropertiesStore();

const propertyId = ref<number>(Number(route.params.id));
const property = ref<any>(null);
const activeTab = ref("units");
const unitStatusFilter = ref("all");
const showAddUnitModal = ref(false);
const showAddTenancyModal = ref(false);
const showAddTenantModal = ref(false);
const showMoveOutModal = ref(false);
const showSignatureModal = ref(false);
const saving = ref(false);
const savingUnit = ref(false);
const creatingTenant = ref(false);
const movingOut = ref(false);
const uploadingSignatures = ref(false);
const generatingContractId = ref<number | null>(null);
const sendingReminderId = ref<number | null>(null);

const confirmDepositForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const showConfirmDepositModal = ref(false);
const currentTenancyForConfirm = ref<any>(null);
const confirmDepositData = ref({
  deposit_payment_method: "mobile_money",
  deposit_payment_reference: "",
});
const showUpdateModal = ref(false);
const currentTenancyForUpdate = ref<any>(null);
const updateData = ref({
  rent_amount: "",
  duration_months: 6,
  status: "active",
  move_in_date: "",
});
const updateForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const showSmsModal = ref(false);
const currentTenancyForContract = ref<Record<string, unknown> | null>(null);
const currentTenancyForSms = ref<Record<string, unknown> | null>(null);
const smsRecipients = ref({
  sendToTenant: true,
  sendToOwner: true,
});
const tenancyForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const tenantForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const unitForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const moveOutForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const selectedTenancyForMoveOut = ref<any>(null);
const moveOutDate = ref("");
const showTenancyDetailsModal = ref(false);
const selectedTenancyForView = ref<any>(null);
const unitImageInput = ref<HTMLInputElement | null>(null);
const unitSelectedImage = ref<File | null>(null);
const unitImagePreview = ref<string | null>(null);
const editingUnitId = ref<number | null>(null);

// Signature upload refs
const ownerSignatureInput = ref<HTMLInputElement | null>(null);
const ownerStampInput = ref<HTMLInputElement | null>(null);
const tenantSignatureInput = ref<HTMLInputElement | null>(null);
const ownerSignatureFile = ref<File | null>(null);
const ownerStampFile = ref<File | null>(null);
const tenantSignatureFile = ref<File | null>(null);
const ownerSignaturePreview = ref<string | null>(null);
const ownerStampPreview = ref<string | null>(null);
const tenantSignaturePreview = ref<string | null>(null);

const tenancyFormData = ref({
  tenant: null,
  unit: null,
  move_in_date: "",
  rent_amount: "",
  rent_period: "month",
  deposit_amount: "",
  currency: "TZS",
  stay_duration_value: "",
  stay_duration_unit: "month",
  status: "active",
  deposit_paid: false,
  deposit_payment_method: "",
  duration_months: 6, // Default 6 months
});

const newTenantData = ref({
  full_name: "",
  id_number: "",
  email: "",
  phone: "",
});

const unitFormData = ref({
  unit_number: "",
  floor: "",
  unit_type: "",
  rent_amount: "",
  status: "vacant",
});

// Unit columns
const unitColumns = [
  { key: "image", label: "Image", width: 80 },
  { key: "unit_number", label: "Unit #", sortable: true },
  { key: "floor", label: "Floor" },
  { key: "unit_type", label: "Type", sortable: true },
  { key: "rent_amount", label: "Rent", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions", width: 100 },
];

// Tenancy columns
const tenancyColumns = [
  { key: "tenant_name", label: "Tenant", sortable: true },
  { key: "unit_number", label: "Unit", sortable: true },
  { key: "contract_start", label: "Start Date", sortable: true },
  { key: "contract_end", label: "End Date", sortable: true },
  { key: "rent_amount", label: "Rent", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions", width: 80 },
];

// Tenant columns
const tenantColumns = [
  { key: "full_name", label: "Name", sortable: true },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "current_unit", label: "Current Unit" },
  { key: "actions", label: "Actions", width: 100 },
];

// Filtered units based on status
const filteredUnits = computed(() => {
  if (unitStatusFilter.value === "all" || !unitStatusFilter.value) {
    return unitsStore.items;
  }
  return unitsStore.items.filter(
    (unit: any) => unit.status === unitStatusFilter.value,
  );
});

// Property tenancies (already filtered by API)
const propertyTenancies = computed(() => {
  return tenanciesStore.items;
});

// Property tenants (already filtered by API with distinct results)
const propertyTenants = computed(() => {
  return tenantsStore.items;
});

// Tenant options for dropdown - load all tenants, not just property-filtered
const tenantOptions = computed(() => {
  if (!tenantsStore.items || tenantsStore.items.length === 0) {
    return [];
  }
  return (tenantsStore.items as any[]).map((tenant) => ({
    value: tenant.id,
    text: tenant.full_name || `Tenant ${tenant.id}`,
  }));
});

// Available units (vacant only) for tenancy
const availableUnitOptions = computed(() => {
  // feed rent amount from the seclect  unit to the tenancy form
  tenancyFormData.value.rent_amount = unitFormData.value.rent_amount;

  return (unitsStore.items as any[])
    .filter((unit) => unit.status === "vacant")
    .map((unit) => ({
      value: unit.id,
      text: `Unit ${unit.unit_number}${
        unit.floor ? " - Floor " + unit.floor : ""
      }`,
    }));
});

const getStatusColor = (status: unknown) => {
  const colors: Record<string, string> = {
    vacant: "success",
    occupied: "info",
    maintenance: "warning",
  };
  return colors[String(status)] || "secondary";
};

const getTenancyStatusColor = (status: any) => {
  const colors: Record<string, string> = {
    active: "success",
    completed: "info",
    terminated: "danger",
    pending_payment: "warning",
  };
  return colors[String(status)] || "secondary";
};

const getTenantCurrentUnit = (tenantId: number) => {
  const activeTenancy = (tenanciesStore.items as any[]).find(
    (tenancy: any) =>
      (tenancy.tenant === tenantId || tenancy.tenant_id === tenantId) &&
      tenancy.status === "active",
  );

  return activeTenancy?.unit_number || "N/A";
};

/**
 * Checks if current date is the rent due date for a tenancy.
 * Due date is defined as the same day of the month as the contract start date.
 */
const isTenancyDueDate = (tenancy: any) => {
  if (tenancy.status !== "active" || !tenancy.contract_start) return false;

  const today = new Date();
  const startDate = new Date(tenancy.contract_start);
  const endDate = tenancy.contract_end ? new Date(tenancy.contract_end) : null;

  // Show if today is the same day of month as start date
  const isSameDayOfMonth = today.getDate() === startDate.getDate();

  // Also show if past contract end date
  const isPastEndDate = endDate ? today > endDate : false;

  return isSameDayOfMonth || isPastEndDate;
};

const loadPropertyData = async () => {
  try {
    // Load property details
    const properties = propertiesStore.items as any[];
    property.value = properties.find((p: any) => p.id === propertyId.value);

    if (!property.value) {
      await propertiesStore.fetchList();
      property.value = (propertiesStore.items as any[]).find(
        (p: any) => p.id === propertyId.value,
      );
    }

    // Load units for this property
    await unitsStore.fetchList({ property: propertyId.value });

    // Load tenancies for this property
    await tenanciesStore.fetchList({ property: propertyId.value });

    // Load tenants for this property (filtered by property)
    await tenantsStore.fetchList({ property: propertyId.value });
  } catch (err) {
    console.error("Error loading property data:", err);
    error("Failed to load property details");
  }
};

const goBack = () => {
  router.push({ name: "properties" });
};

const getLocationDisplay = (property: any): string => {
  if (!property) return "N/A";

  // Check if location_display exists and is valid
  if (
    property.location_display &&
    typeof property.location_display === "string" &&
    !property.location_display.includes("NoneType") &&
    !property.location_display.includes("method-wrapper")
  ) {
    return property.location_display;
  }

  // Fallback to constructing from location parts
  if (property.location) {
    if (typeof property.location === "string") {
      return property.location;
    }
    if (property.location.city || property.location.region) {
      const parts = [];
      if (property.location.city) parts.push(property.location.city);
      if (property.location.region) parts.push(property.location.region);
      if (property.location.country) parts.push(property.location.country);
      return parts.join(", ");
    }
  }

  return "Location not set";
};

const getPropertyType = (property: any): string => {
  if (!property) return "N/A";

  // Check if property_type exists and is valid
  if (
    property.property_type &&
    typeof property.property_type === "string" &&
    !property.property_type.includes("NoneType") &&
    !property.property_type.includes("method-wrapper")
  ) {
    return (
      property.property_type.charAt(0).toUpperCase() +
      property.property_type.slice(1)
    );
  }

  return "Property";
};

const handleUnitImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    error("Please select an image file");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    error("Image size must be less than 5MB");
    return;
  }

  unitSelectedImage.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    unitImagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const removeUnitImage = () => {
  unitSelectedImage.value = null;
  unitImagePreview.value = null;
  if (unitImageInput.value) {
    unitImageInput.value.value = "";
  }
};

const saveUnit = async () => {
  const isValid = await unitForm.value?.validate();
  if (!isValid) return;

  savingUnit.value = true;
  try {
    const unitData = {
      property: propertyId.value,
      unit_number: unitFormData.value.unit_number,
      floor: unitFormData.value.floor,
      unit_type: unitFormData.value.unit_type,
      rent_amount: unitFormData.value.rent_amount,
      status: unitFormData.value.status,
    };

    const payload = buildPayload(unitData, ["property"]);

    // Add base64 image if a new image was selected
    if (unitSelectedImage.value && unitImagePreview.value) {
      payload.image = unitImagePreview.value;
    }

    if (editingUnitId.value) {
      // Update existing unit
      await unitsStore.updateItem(editingUnitId.value, payload);
      success("Unit updated successfully");
    } else {
      // Create new unit
      await unitsStore.createItem(payload);
      success("Unit created successfully");
    }

    closeUnitModal();

    // Refresh units list
    await unitsStore.fetchList({ property: propertyId.value });
  } catch (err: any) {
    console.error("Error creating unit:", err);
    if (err.response?.data) {
      const errorMsg =
        typeof err.response.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response.data;
      error(`Failed to create unit: ${errorMsg}`);
    } else {
      error("Failed to create unit");
    }
  } finally {
    savingUnit.value = false;
  }
};

const closeUnitModal = () => {
  showAddUnitModal.value = false;
  editingUnitId.value = null;
  unitFormData.value = {
    unit_number: "",
    floor: "",
    unit_type: "",
    rent_amount: "",
    status: "vacant",
  };
  removeUnitImage();
};

const editUnit = (unit: any) => {
  // Populate form with unit data
  unitFormData.value = {
    unit_number: String(unit.unit_number ?? ""),
    floor: String(unit.floor ?? ""),
    unit_type: String(unit.unit_type ?? "apartment"),
    rent_amount: String(unit.rent_amount ?? ""),
    status: String(unit.status ?? "vacant"),
  };

  // Reset image state first
  unitSelectedImage.value = null;
  unitImagePreview.value = null;
  if (unitImageInput.value) {
    unitImageInput.value.value = "";
  }

  // Show existing image preview if available
  if (unit.image_url) {
    unitImagePreview.value = String(unit.image_url);
  }

  // Store the unit ID for updating
  editingUnitId.value = unit.id as number;
  showAddUnitModal.value = true;
};

const deleteUnit = async (id: number) => {
  if (confirm("Are you sure you want to delete this unit?")) {
    try {
      await unitsStore.deleteItem(id);
      success("Unit deleted successfully");
      await unitsStore.fetchList({ property: propertyId.value });
    } catch (err) {
      error("Failed to delete unit");
    }
  }
};

const moveOutTenancy = (tenancy: any) => {
  selectedTenancyForMoveOut.value = tenancy;
  moveOutDate.value = "";
  showMoveOutModal.value = true;
};

const confirmMoveOut = async () => {
  const isValid = await moveOutForm.value?.validate();
  if (!isValid) return;

  movingOut.value = true;
  try {
    await tenanciesStore.moveOut(
      selectedTenancyForMoveOut.value.id,
      moveOutDate.value,
    );
    success("Tenant moved out successfully");
    closeMoveOutModal();

    // Refresh data
    await tenanciesStore.fetchList({ property: propertyId.value });
    await unitsStore.fetchList({ property: propertyId.value });
  } catch (err: any) {
    console.error("Error moving out tenant:", err);
    if (err.response?.data) {
      const errorMsg =
        typeof err.response.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response.data;
      error(`Failed to move out tenant: ${errorMsg}`);
    } else {
      error("Failed to move out tenant");
    }
  } finally {
    movingOut.value = false;
  }
};

const closeMoveOutModal = () => {
  showMoveOutModal.value = false;
  selectedTenancyForMoveOut.value = null;
  moveOutDate.value = "";
};

// View tenancy details
const viewTenancyDetails = (tenancy: Record<string, unknown>) => {
  selectedTenancyForView.value = tenancy;
  showTenancyDetailsModal.value = true;
};

const closeTenancyDetailsModal = () => {
  showTenancyDetailsModal.value = false;
  selectedTenancyForView.value = null;
};

const openUpdateModal = (tenancy: any) => {
  currentTenancyForUpdate.value = tenancy;
  updateData.value = {
    rent_amount: String(tenancy.rent_amount || ""),
    duration_months: (tenancy.duration_months as number) || (tenancy.stay_duration_display?.months as number) || 6,
    status: (tenancy.status as string) || "active",
    move_in_date: (tenancy.move_in_date as string) || "",
  };
  showUpdateModal.value = true;
};

const saveUpdate = async () => {
  const isValid = await updateForm.value?.validate();
  if (!isValid || !currentTenancyForUpdate.value) return;

  saving.value = true;
  try {
    const duration = parseInt(String(updateData.value.duration_months));
    const payload = {
      rent_amount: parseFloat(updateData.value.rent_amount),
      duration_months: duration,
      edit_duration_months: duration, // Alternative field as per user's info
      stay_duration_value: duration, // Sync with stay_duration_value
      stay_duration_unit: 'month',
      status: updateData.value.status,
      move_in_date: updateData.value.move_in_date,
    };

    await tenanciesStore.updateItem(currentTenancyForUpdate.value.id as number, payload);
    showUpdateModal.value = false;
    success("Tenancy updated successfully!");
    await loadPropertyData();
  } catch (err: any) {
    console.error("Error updating tenancy:", err);
    error(err.response?.data?.detail || "Failed to update tenancy");
  } finally {
    saving.value = false;
  }
};

// calculateDuration was unused and causing lint warnings


const openConfirmDepositModal = (tenancy: any) => {
  currentTenancyForConfirm.value = tenancy;
  confirmDepositData.value = {
    deposit_payment_method: "mobile_money",
    deposit_payment_reference: "",
  };
  showConfirmDepositModal.value = true;
};

const confirmDeposit = async () => {
  const isValid = await confirmDepositForm.value?.validate();
  if (!isValid || !currentTenancyForConfirm.value) return;

  saving.value = true;
  try {
    await tenanciesStore.updateItem(currentTenancyForConfirm.value.id, {
      deposit_paid: true,
      ...confirmDepositData.value,
    });
    showConfirmDepositModal.value = false;
    success("Deposit confirmed and tenancy activated!");
    // Refresh the property detail view to reflect changes
    await loadPropertyData(); // Changed from fetchPropertyDetails to loadPropertyData
  } catch (err: any) {
    console.error("Error confirming deposit:", err);
    error(err.response?.data?.detail || "Failed to confirm deposit");
  } finally {
    saving.value = false;
  }
};

const downloadUnsignedContract = async (tenancy: Record<string, unknown>) => {
  generatingContractId.value = tenancy.id as number;
  try {
    const response = await tenanciesAPI.generateContract(tenancy.id as number);

    // Create blob and download
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contract_${tenancy.tenant_name}_${tenancy.unit_number}_unsigned.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    success("Unsigned contract downloaded successfully");
  } catch (err: any) {
    console.error("Error downloading contract:", err);
    error("Failed to download unsigned contract");
  } finally {
    generatingContractId.value = null;
  }
};

// Signature upload handlers
const handleOwnerSignatureSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  ownerSignatureFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    ownerSignaturePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const handleOwnerStampSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  ownerStampFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    ownerStampPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const handleTenantSignatureSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  tenantSignatureFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    tenantSignaturePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const uploadSignatures = async () => {
  if (!currentTenancyForContract.value) return;

  uploadingSignatures.value = true;
  try {
    const tenancy = currentTenancyForContract.value;

    // Fetch full tenancy details to get owner information
    const response = await tenanciesAPI.get(tenancy.id as number);
    const fullTenancy = response.data;

    // Get the property to find owner_id
    const propertyResponse = propertiesStore.items.find(
      (p: any) => p.id === propertyId.value,
    );
    const ownerId = propertyResponse?.owner as number | undefined;

    // Upload owner signature and stamp if provided and owner found
    if (
      (ownerSignatureFile.value || ownerStampFile.value) &&
      ownerId !== undefined
    ) {
      const ownerFormData = new FormData();
      if (ownerSignatureFile.value) {
        ownerFormData.append("signature", ownerSignatureFile.value);
      }
      if (ownerStampFile.value) {
        ownerFormData.append("stamp", ownerStampFile.value);
      }
      await ownersAPI.uploadSignature(ownerId, ownerFormData);
    }

    // Upload tenant signature if provided
    if (tenantSignatureFile.value) {
      const tenantFormData = new FormData();
      tenantFormData.append("signature", tenantSignatureFile.value);
      const tenantId = fullTenancy.tenant || tenancy.tenant;
      await tenantsAPI.uploadSignature(tenantId, tenantFormData);
    }

    success("Signatures uploaded successfully");
    closeSignatureModal();

    // Now generate the contract
    await proceedWithContractGeneration(tenancy);
  } catch (err: any) {
    console.error("Error uploading signatures:", err);
    error("Failed to upload signatures");
  } finally {
    uploadingSignatures.value = false;
  }
};

const closeSignatureModal = () => {
  showSignatureModal.value = false;
  currentTenancyForContract.value = null;
  ownerSignatureFile.value = null;
  ownerStampFile.value = null;
  tenantSignatureFile.value = null;
  ownerSignaturePreview.value = null;
  ownerStampPreview.value = null;
  tenantSignaturePreview.value = null;
  if (ownerSignatureInput.value) ownerSignatureInput.value.value = "";
  if (ownerStampInput.value) ownerStampInput.value.value = "";
  if (tenantSignatureInput.value) tenantSignatureInput.value.value = "";
};

const generateContract = async (tenancy: Record<string, unknown>) => {
  // Store tenancy for later use and show signature upload modal
  currentTenancyForContract.value = tenancy;
  showSignatureModal.value = true;
};

const proceedWithContractGeneration = async (
  tenancy: Record<string, unknown>,
) => {
  const tenancyId = tenancy.id as number;
  generatingContractId.value = tenancyId;

  try {
    const response = await tenanciesAPI.generateContract(tenancyId);
    const contractData = response.data;

    // Try to download PDF if available
    if (contractData.contract_pdf_base64) {
      const base64Data = contractData.contract_pdf_base64;
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tenancy_contract_${tenancyId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success("Contract PDF downloaded successfully");
    } else if (contractData.contract_text) {
      // Fallback: Download contract as text file
      const blob = new Blob([contractData.contract_text], {
        type: "text/plain",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tenancy_contract_${tenancyId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success("Contract downloaded as text (PDF generation unavailable)");
    } else {
      error("Contract not available");
    }
  } catch (err: any) {
    console.error("Error generating contract:", err);
    error("Failed to generate contract");
  } finally {
    generatingContractId.value = null;
  }
};

const sendReminder = (tenancy: Record<string, unknown>) => {
  // Store tenancy and show SMS modal
  currentTenancyForSms.value = tenancy;
  smsRecipients.value = {
    sendToTenant: true,
    sendToOwner: true,
  };
  showSmsModal.value = true;
};

const closeSmsModal = () => {
  showSmsModal.value = false;
  currentTenancyForSms.value = null;
  smsRecipients.value = {
    sendToTenant: true,
    sendToOwner: true,
  };
};

const confirmSendReminder = async () => {
  if (!currentTenancyForSms.value) return;

  const tenancyId = currentTenancyForSms.value.id as number;
  sendingReminderId.value = tenancyId;

  try {
    const response = await tenanciesAPI.sendReminder(tenancyId);
    const data = response.data;

    if (data.success) {
      const recipients = [];
      if (smsRecipients.value.sendToTenant) recipients.push("tenant");
      if (smsRecipients.value.sendToOwner) recipients.push("owner");

      success(
        `Rent reminder SMS sent successfully to ${recipients.join(" and ")}!`,
      );

      // Close modal and refresh tenancies
      closeSmsModal();
      await tenanciesStore.fetchList({ property: propertyId.value });
    } else {
      error(data.message || "Failed to send SMS reminder");
    }
  } catch (err: any) {
    console.error("Error sending reminder:", err);
    if (err.response?.data?.message) {
      error(err.response.data.message);
    } else {
      error("Failed to send SMS reminder. Please try again.");
    }
  } finally {
    sendingReminderId.value = null;
  }
};

const viewTenant = (tenant: any) => {
  router.push({ name: "tenants", query: { id: tenant.id } });
};

const openAddTenancyModal = async () => {
  // Load all tenants for this property's owner
  try {
    if (property.value?.owner || property.value?.owner_id) {
      const ownerId = property.value.owner || property.value.owner_id;
      await tenantsStore.fetchList({ owner: ownerId });
    } else {
      await tenantsStore.fetchList();
    }
    showAddTenancyModal.value = true;
  } catch (err) {
    console.error("Error loading tenants:", err);
    showAddTenancyModal.value = true;
  }
};

const openAddTenantModal = () => {
  showAddTenantModal.value = true;
};

const closeAddTenantModal = () => {
  showAddTenantModal.value = false;
  newTenantData.value = {
    full_name: "",
    id_number: "",
    email: "",
    phone: "",
  };
};

const createNewTenant = async () => {
  const isValid = await tenantForm.value?.validate();
  if (!isValid) return;

  creatingTenant.value = true;
  try {
    const ownerId = property.value?.owner || property.value?.owner_id;
    const tenantPayload = {
      full_name: newTenantData.value.full_name,
      id_number: newTenantData.value.id_number,
      email: newTenantData.value.email,
      phone: newTenantData.value.phone,
      owner: ownerId,
    };

    const newTenant = (await tenantsStore.createItem(tenantPayload)) as any;
    success("Tenant created successfully");

    // Refresh tenants list with owner filter to match the dropdown's expected data
    if (property.value?.owner || property.value?.owner_id) {
      const ownerId = property.value.owner || property.value.owner_id;
      await tenantsStore.fetchList({ owner: ownerId });
    } else {
      await tenantsStore.fetchList();
    }

    // Select the newly created tenant
    tenancyFormData.value.tenant = newTenant?.id;

    // Close modal and reset form
    closeAddTenantModal();
  } catch (err: any) {
    console.error("Error creating tenant:", err);
    if (err.response?.data) {
      const errorMsg =
        typeof err.response.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response.data;
      error(`Failed to create tenant: ${errorMsg}`);
    } else {
      error("Failed to create tenant");
    }
  } finally {
    creatingTenant.value = false;
  }
};

const saveTenancy = async () => {
  const isValid = await tenancyForm.value?.validate();
  if (!isValid) return;



  // Validation: Payment method required if deposit is paid
  if (
    tenancyFormData.value.deposit_paid &&
    !tenancyFormData.value.deposit_payment_method
  ) {
    error("Please select a payment method");
    return;
  }

  saving.value = true;
  try {
    const stayDurationValue = parseInt(String(tenancyFormData.value.stay_duration_value)) || tenancyFormData.value.duration_months || 6;
    const stayDurationUnit = tenancyFormData.value.stay_duration_unit || "month";
    const rentAmount = parseFloat(tenancyFormData.value.rent_amount);
    const calculatedDeposit = rentAmount * stayDurationValue;

    // Build robust payload according to new billing system
    const tenancyPayload: any = {
      tenant: tenancyFormData.value.tenant,
      unit: tenancyFormData.value.unit,
      move_in_date: tenancyFormData.value.move_in_date,
      contract_start: tenancyFormData.value.move_in_date, // Required field
      rent_amount: rentAmount,
      rent_period: tenancyFormData.value.rent_period || "month",
      deposit_amount: tenancyFormData.value.deposit_amount || calculatedDeposit,
      deposit_paid: tenancyFormData.value.deposit_paid,
      currency: tenancyFormData.value.currency || "TZS",
      status: tenancyFormData.value.status || "active",
      // Synchronize both fields to ensure backend receives correct duration
      duration_months: stayDurationUnit === 'month' ? stayDurationValue : Math.ceil(stayDurationValue / 30),
      stay_duration_value: stayDurationValue,
      stay_duration_unit: stayDurationUnit,
    };

    // Add payment method only if deposit is paid
    if (
      tenancyFormData.value.deposit_paid &&
      tenancyFormData.value.deposit_payment_method
    ) {
      tenancyPayload.deposit_payment_method =
        tenancyFormData.value.deposit_payment_method;
    }

    console.log("Creating tenancy with payload:", tenancyPayload);

    await tenanciesStore.createItem(tenancyPayload);
    closeTenancyModal();

    success("Tenancy created successfully!");

    // Refresh data
    await tenanciesStore.fetchList({ property: propertyId.value });
    await unitsStore.fetchList({ property: propertyId.value });
  } catch (err: any) {
    console.error("Error creating tenancy:", err);

    // Enhanced error handling
    if (err.response?.data) {
      console.error("API Error details:", err.response.data);

      // Handle specific error cases
      if (err.response.data.unit) {
        error(`Unit Error: ${err.response.data.unit}`);
      } else if (err.response.data.detail) {
        error(`Error: ${err.response.data.detail}`);
      } else if (err.response.data.non_field_errors) {
        error(`Error: ${err.response.data.non_field_errors.join(", ")}`);
      } else {
        const errorMsg =
          typeof err.response.data === "object"
            ? JSON.stringify(err.response.data)
            : err.response.data;
        error(`Failed to create tenancy: ${errorMsg}`);
      }
    } else if (err.message) {
      error(`Network error: ${err.message}`);
    } else {
      error("Failed to create tenancy. Please try again.");
    }
  } finally {
    saving.value = false;
  }
};

const closeTenancyModal = () => {
  showAddTenancyModal.value = false;
  tenancyFormData.value = {
    tenant: null,
    unit: null,
    move_in_date: "",
    rent_amount: "",
    rent_period: "month",
    deposit_amount: "",
    currency: "TZS",
    stay_duration_value: "",
    stay_duration_unit: "month",
    status: "active",
    deposit_paid: false,
    deposit_payment_method: "",
    duration_months: 6,
  };
};

onMounted(() => {
  loadPropertyData();
});

// Watch for tab changes and refresh data
watch(activeTab, async (newTab) => {
  try {
    if (newTab === "units") {
      await unitsStore.fetchList({ property: propertyId.value });
    } else if (newTab === "tenancies") {
      await tenanciesStore.fetchList({ property: propertyId.value });
    } else if (newTab === "tenants") {
      await tenantsStore.fetchList({ property: propertyId.value });
    }
  } catch (err) {
    console.error(`Error refreshing ${newTab} data:`, err);
  }
});

// 2️⃣ Watch selected unit (auto-fill rent)
watch(
  () => tenancyFormData.value.unit,
  (selectedUnitId) => {
    if (!selectedUnitId) return;

    const selectedUnit = (unitsStore.items as any[])?.find(
      (unit) => unit.id === selectedUnitId,
    );

    if (selectedUnit) {
      tenancyFormData.value.rent_amount = String(
        selectedUnit.rent_amount ?? "",
      );
    }
  },
);
watch(
  [
    () => tenancyFormData.value.rent_amount,
    () => tenancyFormData.value.stay_duration_value,
  ],
  ([rent, duration]) => {
    const rentNumber = parseFloat(String(rent));
    const durationNumber = parseFloat(String(duration));

    if (!rentNumber || !durationNumber) {
      tenancyFormData.value.deposit_amount = "";
      return;
    }

    tenancyFormData.value.deposit_amount = String(rentNumber * durationNumber);

    // Sync duration_months for backend consistency
    if (tenancyFormData.value.stay_duration_unit === "month") {
      tenancyFormData.value.duration_months = Math.floor(durationNumber);
    } else {
      tenancyFormData.value.duration_months = Math.ceil(durationNumber / 30);
    }
  },
);
</script>

<style scoped>
.property-details {
  padding: 0 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.details-header {
  margin-bottom: 2rem;
}

.property-info {
  margin-top: 1rem;
}

.property-main-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.property-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid var(--va-background-border);
}

.property-image-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--va-background-secondary);
  border-radius: 12px;
  border: 2px solid var(--va-background-border);
  color: var(--va-text-secondary);
}

.property-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.property-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--va-text-primary) !important;
  letter-spacing: -0.02em;
}

.visibility-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.75rem;
}

.property-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0;
  color: var(--va-text-secondary);
  font-size: 0.95rem;
}

.property-tabs {
  margin-bottom: 1.5rem;
}

.tab-icon {
  margin-right: 0.5rem;
}

.tab-content {
  padding: 1rem 0;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tab-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--va-text-primary);
}

.tab-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.unit-image-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.unit-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--va-background-border);
}

.unit-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--va-background-secondary);
  border-radius: 8px;
  border: 1px solid var(--va-background-border);
  color: var(--va-text-secondary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.tenant-select-group {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.tenant-select-group .va-select {
  flex: 1;
}

.add-tenant-btn {
  flex-shrink: 0;
  margin-bottom: 0.125rem;
}

.image-upload-container {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed var(--va-background-border);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}

.image-upload-container:hover {
  border-color: var(--va-primary);
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 4px;
}

.image-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--va-text-secondary);
}

.image-upload-placeholder p {
  margin-top: 8px;
  font-size: 0.875rem;
}

.image-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.sms-modal-container {
  padding: 1rem 0;
}

.recipient-selection {
  border: 1px solid var(--va-background-border);
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--va-background-secondary);
}

.recipient-info {
  font-size: 0.875rem;
  color: #718096;
  margin: 0.25rem 0 0 0;
}

.dropdown-actions-list {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
}

.dropdown-action-item {
  justify-content: flex-start !important;
  width: 100%;
  text-align: left;
}

/* Premium Tenancy Details Styles */
.tenancy-premium-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
  border-radius: 16px;
  margin-bottom: 2rem;
}

.tenant-avatar-large {
  width: 64px;
  height: 64px;
  background: var(--va-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.3);
}

.tenant-info-main h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.status-badge-premium {
  margin-top: 0.5rem;
}

.premium-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.premium-detail-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--va-background-card-primary);
  border: 1px solid var(--va-background-border);
  border-radius: 12px;
  transition: transform 0.2s;
}

.premium-detail-card:hover {
  transform: translateY(-2px);
  border-color: var(--va-primary);
}

.premium-detail-card.full-width {
  grid-column: span 2;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--va-text-secondary);
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.card-content p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.card-content .period {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--va-text-secondary);
}

.flex-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.date-divider {
  width: 1px;
  height: 30px;
  background: var(--va-background-border);
}

/* Signature Redesign Styles */
.signature-premium-container {
  padding: 0.5rem;
}

.signature-header-info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--va-background-border);
}

.signature-header-info h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.signature-header-info p {
  margin: 0.25rem 0 0 0;
  color: var(--va-text-secondary);
}

.signature-sections-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.signature-card {
  background: var(--va-background-card-primary);
  border: 1px solid var(--va-background-border);
  border-radius: 20px;
  padding: 2rem 1.5rem 1.5rem;
  position: relative;
}

.card-badge {
  position: absolute;
  top: -12px;
  left: 1.5rem;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.card-badge.owner { background: #10b981; color: white; }
.card-badge.tenant { background: #3b82f6; color: white; }

.signature-upload-areas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.signature-upload-areas.single {
  grid-template-columns: 1fr;
}

.upload-box-premium label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--va-text-secondary);
}

.upload-zone {
  height: 120px;
  border: 2px dashed var(--va-background-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(var(--va-primary-rgb), 0.02);
  transition: all 0.3s ease;
  overflow: hidden;
}

.upload-zone:hover {
  border-color: var(--va-primary);
  background: rgba(var(--va-primary-rgb), 0.05);
}

.upload-zone .placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--va-text-secondary);
  font-size: 0.8rem;
  gap: 0.5rem;
}

.upload-zone .preview img {
  max-width: 100%;
  max-height: 110px;
  object-fit: contain;
}

.modal-actions-premium {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.premium-btn {
  border-radius: 12px !important;
  font-weight: 700 !important;
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
}

.primary-gradient {
  background: linear-gradient(135deg, #10b981, #3b82f6) !important;
  color: white !important;
}

.shadow-sm {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 992px) {
  .signature-sections-grid { grid-template-columns: 1fr; }
  .premium-detail-grid { grid-template-columns: 1fr; }
  .premium-detail-card.full-width { grid-column: span 1; }
  .flex-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .date-divider { display: none; }
}
</style>
